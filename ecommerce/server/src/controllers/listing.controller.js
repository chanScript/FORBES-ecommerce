const prisma = require('../config/db');
const slugify = require('slugify');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

/**
 * GET /api/listings — Public: list approved, non-deleted listings with filters.
 */
async function listListings(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = buildPublicWhere(req.query);
    const orderBy = buildOrderBy(req.query.sort);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
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
      prisma.listing.count({ where }),
    ]);

    res.json(paginatedResponse(listings, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/listings/:slug — Public: single listing detail.
 */
async function getListingBySlug(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({
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

    if (!listing || listing.isDeleted || listing.status !== 'Approved') {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    let isFavorited = false;
    if (req.user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: req.user.id, listingId: listing.id } },
      });
      isFavorited = !!fav;
    }

    res.json({ ...listing, isFavorited });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/listings — Admin/Seller: create a new listing.
 */
async function createListing(req, res, next) {
  try {
    const {
      category, vehicleSubtype, realEstateSubtype,
      description, price, city, condition,
      // Vehicle fields
      year, mileage, fuelType, transmission, engineCapacity, color, seats,
      brandId, modelId, vehicleTypeId,
      // Real estate fields
      lotArea, floorArea, bedrooms, bathrooms, parkingSpaces,
      furnishingStatus, amenities, propertyAge, titleType,
    } = req.body;

    const title = await generateTitle({
      category, vehicleSubtype, realEstateSubtype,
      year, brandId, modelId, city,
    });
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${require('crypto').randomUUID().slice(0, 8)}`;

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);

    const data = {
      title,
      slug,
      description: description || null,
      price: parseFloat(price),
      city,
      condition: condition || 'Used',
      status: isAdmin ? 'Approved' : 'Pending',
      category,
      sellerId: req.user.id,
    };

    if (isAdmin) {
      data.approvedAt = new Date();
      data.approvedBy = req.user.id;
    }

    // Category-specific fields
    if (category === 'Vehicle') {
      data.vehicleSubtype = vehicleSubtype;
      data.year = year ? parseInt(year, 10) : null;
      data.mileage = mileage ? parseInt(mileage, 10) : null;
      data.fuelType = fuelType || null;
      data.transmission = transmission || null;
      data.engineCapacity = engineCapacity ? parseInt(engineCapacity, 10) : null;
      data.color = color || null;
      data.seats = seats ? parseInt(seats, 10) : null;
      data.brandId = brandId ? parseInt(brandId, 10) : null;
      data.modelId = modelId ? parseInt(modelId, 10) : null;
      data.vehicleTypeId = vehicleTypeId ? parseInt(vehicleTypeId, 10) : null;
    } else if (category === 'RealEstate') {
      data.realEstateSubtype = realEstateSubtype;
      data.lotArea = lotArea ? parseFloat(lotArea) : null;
      data.floorArea = floorArea ? parseFloat(floorArea) : null;
      data.bedrooms = bedrooms ? parseInt(bedrooms, 10) : null;
      data.bathrooms = bathrooms ? parseInt(bathrooms, 10) : null;
      data.parkingSpaces = parkingSpaces ? parseInt(parkingSpaces, 10) : null;
      data.furnishingStatus = furnishingStatus || null;
      data.amenities = amenities || null;
      data.propertyAge = propertyAge ? parseInt(propertyAge, 10) : null;
      data.titleType = titleType || null;
    }

    const listing = await prisma.listing.create({
      data,
      include: { brand: true, model: true, vehicleType: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_SUBMITTED',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/listings/my-listings — Seller: own listings.
 */
async function getMyListings(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { sellerId: req.user.id, isDeleted: false };
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
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
      prisma.listing.count({ where }),
    ]);

    res.json(paginatedResponse(listings, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/listings/:id — Seller: edit own pending/rejected listing.
 */
async function updateListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings.' });
    }

    if (!['Pending', 'Rejected'].includes(listing.status)) {
      return res.status(400).json({ error: 'Can only edit pending or rejected listings.' });
    }

    const {
      description, price, city, condition, category,
      vehicleSubtype, realEstateSubtype,
      year, mileage, fuelType, transmission, engineCapacity, color, seats,
      brandId, modelId, vehicleTypeId,
      lotArea, floorArea, bedrooms, bathrooms, parkingSpaces,
      furnishingStatus, amenities, propertyAge, titleType,
    } = req.body;

    const updateData = {
      description: description !== undefined ? description : listing.description,
      price: price ? parseFloat(price) : listing.price,
      city: city || listing.city,
      condition: condition || listing.condition,
      status: 'Pending',
      rejectionReason: null,
    };

    // Regenerate title if needed
    const effectiveCategory = category || listing.category;
    if (category || brandId || modelId || year) {
      const newTitle = await generateTitle({
        category: effectiveCategory,
        vehicleSubtype: vehicleSubtype || listing.vehicleSubtype,
        realEstateSubtype: realEstateSubtype || listing.realEstateSubtype,
        year: year ? parseInt(year, 10) : listing.year,
        brandId: brandId ? parseInt(brandId, 10) : listing.brandId,
        modelId: modelId ? parseInt(modelId, 10) : listing.modelId,
        city: city || listing.city,
      });
      updateData.title = newTitle;
      updateData.slug = `${slugify(newTitle, { lower: true, strict: true })}-${Date.now().toString(36)}`;
    }

    // Vehicle fields
    if (effectiveCategory === 'Vehicle') {
      updateData.vehicleSubtype = vehicleSubtype || listing.vehicleSubtype;
      updateData.year = year ? parseInt(year, 10) : listing.year;
      updateData.mileage = mileage !== undefined ? (mileage ? parseInt(mileage, 10) : null) : listing.mileage;
      updateData.fuelType = fuelType || listing.fuelType;
      updateData.transmission = transmission || listing.transmission;
      updateData.engineCapacity = engineCapacity !== undefined ? (engineCapacity ? parseInt(engineCapacity, 10) : null) : listing.engineCapacity;
      updateData.color = color !== undefined ? color : listing.color;
      updateData.seats = seats !== undefined ? (seats ? parseInt(seats, 10) : null) : listing.seats;
      updateData.brandId = brandId ? parseInt(brandId, 10) : listing.brandId;
      updateData.modelId = modelId ? parseInt(modelId, 10) : listing.modelId;
      updateData.vehicleTypeId = vehicleTypeId ? parseInt(vehicleTypeId, 10) : listing.vehicleTypeId;
    } else if (effectiveCategory === 'RealEstate') {
      updateData.realEstateSubtype = realEstateSubtype || listing.realEstateSubtype;
      updateData.lotArea = lotArea !== undefined ? (lotArea ? parseFloat(lotArea) : null) : listing.lotArea;
      updateData.floorArea = floorArea !== undefined ? (floorArea ? parseFloat(floorArea) : null) : listing.floorArea;
      updateData.bedrooms = bedrooms !== undefined ? (bedrooms ? parseInt(bedrooms, 10) : null) : listing.bedrooms;
      updateData.bathrooms = bathrooms !== undefined ? (bathrooms ? parseInt(bathrooms, 10) : null) : listing.bathrooms;
      updateData.parkingSpaces = parkingSpaces !== undefined ? (parkingSpaces ? parseInt(parkingSpaces, 10) : null) : listing.parkingSpaces;
      updateData.furnishingStatus = furnishingStatus !== undefined ? furnishingStatus : listing.furnishingStatus;
      updateData.amenities = amenities !== undefined ? amenities : listing.amenities;
      updateData.propertyAge = propertyAge !== undefined ? (propertyAge ? parseInt(propertyAge, 10) : null) : listing.propertyAge;
      updateData.titleType = titleType !== undefined ? titleType : listing.titleType;
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: updateData,
      include: { brand: true, model: true, vehicleType: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_UPDATED',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/listings/:id — Seller: soft-delete own listing.
 */
async function deleteListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (listing.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own listings.' });
    }

    await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_SOFT_DELETE',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/listings/:id/images — Upload images for a listing.
 */
async function uploadImages(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (listing.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    const existingCount = await prisma.listingImage.count({ where: { listingId: listing.id } });
    if (existingCount + req.files.length > 10) {
      return res.status(400).json({ error: `Maximum 10 images per listing. Currently ${existingCount} uploaded.` });
    }

    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { publicId, url } = await uploadToCloudinary(file.buffer);
      const image = await prisma.listingImage.create({
        data: {
          listingId: listing.id,
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
 * DELETE /api/listings/images/:imageId — Delete a listing image.
 */
async function deleteImage(req, res, next) {
  try {
    const image = await prisma.listingImage.findUnique({
      where: { id: parseInt(req.params.imageId, 10) },
      include: { listing: true },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role.name);
    if (image.listing.sellerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await cloudinary.uploader.destroy(image.publicId);
    await prisma.listingImage.delete({ where: { id: image.id } });

    res.json({ message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/listings/seller/:sellerId — Public seller profile.
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
      prisma.listing.findMany({
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
      prisma.listing.count({ where }),
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

// ============================================================
// Helpers
// ============================================================

async function generateTitle({ category, vehicleSubtype, realEstateSubtype, year, brandId, modelId, city }) {
  if (category === 'Vehicle' && brandId && modelId) {
    const [brand, model] = await Promise.all([
      prisma.brand.findUnique({ where: { id: parseInt(brandId, 10) } }),
      prisma.model.findUnique({ where: { id: parseInt(modelId, 10) } }),
    ]);
    if (brand && model) {
      return `${year || ''} ${brand.name} ${model.name}`.trim();
    }
  }
  if (category === 'RealEstate') {
    const subtypeLabel = {
      HouseAndLot: 'House & Lot',
      VacantLot: 'Vacant Lot',
      CommercialProperty: 'Commercial Property',
    }[realEstateSubtype] || 'Property';
    return `${subtypeLabel} in ${city || 'Philippines'}`;
  }
  const subtypeLabel = vehicleSubtype || 'Listing';
  return `${year || ''} ${subtypeLabel}`.trim();
}

function buildPublicWhere(query) {
  const where = { isDeleted: false, status: 'Approved' };

  // Category filter
  if (query.category) where.category = query.category;
  if (query.vehicleSubtype) where.vehicleSubtype = query.vehicleSubtype;
  if (query.realEstateSubtype) where.realEstateSubtype = query.realEstateSubtype;

  // Vehicle filters
  if (query.brand) {
    const parsed = parseInt(query.brand, 10);
    if (!isNaN(parsed)) where.brandId = parsed;
    else where.brand = { slug: query.brand };
  }
  if (query.model) where.modelId = parseInt(query.model, 10);
  if (query.vehicleType) {
    const parsed = parseInt(query.vehicleType, 10);
    if (!isNaN(parsed)) where.vehicleTypeId = parsed;
    else where.vehicleType = { slug: query.vehicleType };
  }
  if (query.fuelType) where.fuelType = query.fuelType;
  if (query.transmission) where.transmission = query.transmission;
  if (query.condition) where.condition = query.condition;
  if (query.color) where.color = query.color;

  // Real estate filters
  if (query.minBedrooms) where.bedrooms = { gte: parseInt(query.minBedrooms, 10) };
  if (query.minBathrooms) where.bathrooms = { gte: parseInt(query.minBathrooms, 10) };
  if (query.furnishingStatus) where.furnishingStatus = query.furnishingStatus;

  // Shared numeric ranges
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

  if (query.city) where.city = query.city;
  if (query.seats) where.seats = parseInt(query.seats, 10);

  if (query.minLotArea || query.maxLotArea) {
    where.lotArea = {};
    if (query.minLotArea) where.lotArea.gte = parseFloat(query.minLotArea);
    if (query.maxLotArea) where.lotArea.lte = parseFloat(query.maxLotArea);
  }

  if (query.minFloorArea || query.maxFloorArea) {
    where.floorArea = {};
    if (query.minFloorArea) where.floorArea.gte = parseFloat(query.minFloorArea);
    if (query.maxFloorArea) where.floorArea.lte = parseFloat(query.maxFloorArea);
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'price_asc': return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'newest': return { createdAt: 'desc' };
    case 'oldest': return { createdAt: 'asc' };
    case 'year_desc': return { year: 'desc' };
    case 'year_asc': return { year: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

module.exports = {
  listListings,
  getListingBySlug,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  uploadImages,
  deleteImage,
  getSellerProfile,
};
