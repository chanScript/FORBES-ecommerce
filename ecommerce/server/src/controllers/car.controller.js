const prisma = require('../config/db');
const slugify = require('slugify');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

/**
 * GET /api/cars — Public: list approved, non-deleted cars with filters.
 */
async function listCars(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = buildPublicWhere(req.query);
    const orderBy = buildOrderBy(req.query.sort);

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          vehicleType: true,
          images: { where: { isPrimary: true }, take: 1 },
          seller: { select: { id: true, name: true, phone: true } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.car.count({ where }),
    ]);

    res.json(paginatedResponse(cars, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cars/:slug — Public: single car detail.
 */
async function getCarBySlug(req, res, next) {
  try {
    const car = await prisma.car.findUnique({
      where: { slug: req.params.slug },
      include: {
        brand: true,
        model: true,
        vehicleType: true,
        images: { orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, name: true, phone: true, email: true } },
        _count: { select: { favorites: true } },
      },
    });

    if (!car || car.isDeleted || car.status !== 'Approved') {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Check if current user has favorited
    let isFavorited = false;
    if (req.user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_carId: { userId: req.user.id, carId: car.id } },
      });
      isFavorited = !!fav;
    }

    res.json({ ...car, isFavorited });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cars — Seller: submit a new listing (status: Pending).
 */
async function createCar(req, res, next) {
  try {
    const {
      description, price, year, mileage, fuelType, transmission,
      engineCapacity, color, seats, city, condition,
      brandId, modelId, vehicleTypeId,
    } = req.body;

    // Fetch brand & model names for title/slug generation
    const [brand, model] = await Promise.all([
      prisma.brand.findUnique({ where: { id: parseInt(brandId, 10) } }),
      prisma.model.findUnique({ where: { id: parseInt(modelId, 10) } }),
    ]);

    if (!brand || !model) {
      return res.status(400).json({ error: 'Invalid brand or model.' });
    }

    const title = `${year} ${brand.name} ${model.name}`;
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${require('crypto').randomUUID().slice(0, 8)}`;

    // Admin/Super Admin vehicles are auto-approved; Seller vehicles are Pending
    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    const carData = {
      title,
      slug,
      description: description || null,
      price: parseFloat(price),
      year: parseInt(year, 10),
      mileage: parseInt(mileage, 10),
      fuelType,
      transmission,
      engineCapacity: engineCapacity ? parseInt(engineCapacity, 10) : null,
      color: color || null,
      seats: seats ? parseInt(seats, 10) : null,
      city,
      condition: condition || 'Used',
      status: isAdmin ? 'Approved' : 'Pending',
      brandId: parseInt(brandId, 10),
      modelId: parseInt(modelId, 10),
      vehicleTypeId: parseInt(vehicleTypeId, 10),
      sellerId: req.user.id,
    };

    if (isAdmin) {
      carData.approvedAt = new Date();
      carData.approvedBy = req.user.id;
    }

    const car = await prisma.car.create({
      data: carData,
      include: { brand: true, model: true, vehicleType: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_LISTING_SUBMITTED',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    res.status(201).json(car);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cars/my-listings — Seller: own listings.
 */
async function getMyListings(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = {
      sellerId: req.user.id,
      isDeleted: false,
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          vehicleType: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.car.count({ where }),
    ]);

    res.json(paginatedResponse(cars, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/cars/:id — Seller: edit own pending/rejected listing.
 */
async function updateCar(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    if (car.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings.' });
    }

    if (!['Pending', 'Rejected'].includes(car.status)) {
      return res.status(400).json({ error: 'Can only edit pending or rejected listings.' });
    }

    const {
      description, price, year, mileage, fuelType, transmission,
      engineCapacity, color, seats, city, condition,
      brandId, modelId, vehicleTypeId,
    } = req.body;

    // Regenerate title/slug if brand/model/year changed
    let updateData = {};
    const newBrandId = brandId ? parseInt(brandId, 10) : car.brandId;
    const newModelId = modelId ? parseInt(modelId, 10) : car.modelId;
    const newYear = year ? parseInt(year, 10) : car.year;

    if (brandId || modelId || year) {
      const [brand, model] = await Promise.all([
        prisma.brand.findUnique({ where: { id: newBrandId } }),
        prisma.model.findUnique({ where: { id: newModelId } }),
      ]);
      const title = `${newYear} ${brand.name} ${model.name}`;
      const baseSlug = slugify(title, { lower: true, strict: true });
      updateData.title = title;
      updateData.slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Re-submit as pending on edit
    updateData = {
      ...updateData,
      description: description !== undefined ? description : car.description,
      price: price ? parseFloat(price) : car.price,
      year: newYear,
      mileage: mileage ? parseInt(mileage, 10) : car.mileage,
      fuelType: fuelType || car.fuelType,
      transmission: transmission || car.transmission,
      engineCapacity: engineCapacity !== undefined ? (engineCapacity ? parseInt(engineCapacity, 10) : null) : car.engineCapacity,
      color: color !== undefined ? color : car.color,
      seats: seats !== undefined ? (seats ? parseInt(seats, 10) : null) : car.seats,
      city: city || car.city,
      condition: condition || car.condition,
      brandId: newBrandId,
      modelId: newModelId,
      vehicleTypeId: vehicleTypeId ? parseInt(vehicleTypeId, 10) : car.vehicleTypeId,
      status: 'Pending',
      rejectionReason: null,
    };

    const updated = await prisma.car.update({
      where: { id: req.params.id },
      data: updateData,
      include: { brand: true, model: true, vehicleType: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_LISTING_UPDATED',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cars/:id — Seller: soft-delete own listing.
 */
async function deleteCar(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Sellers can only delete their own; Admin/Super Admin can delete any
    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (car.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own listings.' });
    }

    await prisma.car.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_SOFT_DELETE',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cars/:id/images — Upload images for a car listing.
 */
async function uploadImages(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Sellers can upload to own cars; Admins can upload to any
    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (car.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    // Check existing image count (max 10 per car)
    const existingCount = await prisma.carImage.count({ where: { carId: car.id } });
    if (existingCount + req.files.length > 10) {
      return res.status(400).json({ error: `Maximum 10 images per car. Currently ${existingCount} uploaded.` });
    }

    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { publicId, url } = await uploadToCloudinary(file.buffer);
      const image = await prisma.carImage.create({
        data: {
          carId: car.id,
          url,
          publicId,
          isPrimary: existingCount === 0 && i === 0,
          sortOrder: existingCount + i,
        },
      });
      images.push(image);
    }

    res.status(201).json(images);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cars/images/:imageId — Delete a car image.
 */
async function deleteImage(req, res, next) {
  try {
    const image = await prisma.carImage.findUnique({
      where: { id: parseInt(req.params.imageId, 10) },
      include: { car: true },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (image.car.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from DB
    await prisma.carImage.delete({ where: { id: image.id } });

    res.json({ message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// Helper: Build WHERE clause for public car listing
// ============================================================
function buildPublicWhere(query) {
  const where = {
    isDeleted: false,
    status: 'Approved',
  };

  if (query.brand) {
    const parsed = parseInt(query.brand, 10);
    if (!isNaN(parsed)) {
      where.brandId = parsed;
    } else {
      where.brand = { slug: query.brand };
    }
  }
  if (query.model) where.modelId = parseInt(query.model, 10);
  if (query.vehicleType) {
    const parsed = parseInt(query.vehicleType, 10);
    if (!isNaN(parsed)) {
      where.vehicleTypeId = parsed;
    } else {
      where.vehicleType = { slug: query.vehicleType };
    }
  }
  if (query.fuelType) where.fuelType = query.fuelType;
  if (query.transmission) where.transmission = query.transmission;
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.color) where.color = { contains: query.color, mode: 'insensitive' };
  if (query.condition) where.condition = query.condition;

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }

  if (query.minYear || query.maxYear) {
    where.year = {};
    if (query.minYear) where.year.gte = parseInt(query.minYear, 10);
    if (query.maxYear) where.year.lte = parseInt(query.maxYear, 10);
  }

  if (query.minMileage || query.maxMileage) {
    where.mileage = {};
    if (query.minMileage) where.mileage.gte = parseInt(query.minMileage, 10);
    if (query.maxMileage) where.mileage.lte = parseInt(query.maxMileage, 10);
  }

  if (query.seats) where.seats = parseInt(query.seats, 10);

  if (query.engineMin || query.engineMax) {
    where.engineCapacity = {};
    if (query.engineMin) where.engineCapacity.gte = parseInt(query.engineMin, 10);
    if (query.engineMax) where.engineCapacity.lte = parseInt(query.engineMax, 10);
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { brand: { name: { contains: query.search, mode: 'insensitive' } } },
      { model: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}

// ============================================================
// Helper: Build ORDER BY clause
// ============================================================
function buildOrderBy(sort) {
  switch (sort) {
    case 'price_asc': return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'newest': return { createdAt: 'desc' };
    case 'oldest': return { createdAt: 'asc' };
    case 'mileage_asc': return { mileage: 'asc' };
    case 'mileage_desc': return { mileage: 'desc' };
    case 'year_desc': return { year: 'desc' };
    case 'year_asc': return { year: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

/**
 * GET /api/cars/seller/:sellerId — Public seller profile with their listings.
 */
async function getSellerProfile(req, res, next) {
  try {
    const seller = await prisma.user.findUnique({
      where: { id: req.params.sellerId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }

    const { page, limit, skip } = parsePagination(req.query);

    const where = {
      sellerId: seller.id,
      status: 'Approved',
      isDeleted: false,
    };

    const [listings, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          vehicleType: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.car.count({ where }),
    ]);

    res.json({
      seller: {
        id: seller.id,
        name: seller.name,
        phone: seller.phone,
        memberSince: seller.createdAt,
        role: seller.role.name,
      },
      listings: paginatedResponse(listings, total, page, limit),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCars,
  getCarBySlug,
  createCar,
  getMyListings,
  updateCar,
  deleteCar,
  uploadImages,
  deleteImage,
  getSellerProfile,
};
