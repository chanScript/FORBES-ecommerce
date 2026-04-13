const prisma = require('../config/db');
const slugify = require('slugify');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const { uploadImageLocal, deleteLocalFile } = require('../middleware/upload.middleware');
const { createNotification } = require('../utils/notification.service');

const VALID_TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const VALID_FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const sanitizeTransmission = (v) => VALID_TRANSMISSIONS.includes(v) ? v : null;
const sanitizeFuelType = (v) => VALID_FUEL_TYPES.includes(v) ? v : null;

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
          images: { where: { isPrimary: true }, take: 1 },
          seller: { select: { id: true, name: true, phone: true } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Use sellerName if available (from submission conversion)
    listings.forEach(listing => {
      if (listing.sellerName) {
        listing.seller.name = listing.sellerName;
        if (listing.sellerPhone) listing.seller.phone = listing.sellerPhone;
      }
    });

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
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
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

    // Use sellerName and sellerPhone if available (from submission conversion)
    if (listing.sellerName) {
      listing.seller.name = listing.sellerName;
      if (listing.sellerPhone) listing.seller.phone = listing.sellerPhone;
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
      brand, model, bodyType,
      year, mileage, fuelType, transmission, engineCapacity, color, seats,
      engineType, horsepower, torque, fuelEconomy, topSpeed,
      variant, interiorColor, drivetrain, plateNumber, vinNumber,
      features, safetyFeatures,
      overallCondition, accidentHistory, serviceHistoryAvailable,
      previousOwners, lastMaintenanceDate, tiresCondition, knownIssues,
      ownershipDetails,
      negotiable, reasonForSelling, viewingAvailability,
      // Real estate fields
      lotArea, floorArea, bedrooms, bathrooms, parkingSpaces,
      furnishingStatus, amenities, propertyAge, titleType,
    } = req.body;

    const title = generateTitle({
      category, vehicleSubtype, realEstateSubtype,
      year, brand, model, city,
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
      data.brand = brand || null;
      data.model = model || null;
      data.bodyType = bodyType || null;
      data.year = year ? parseInt(year, 10) : null;
      data.mileage = mileage ? parseInt(mileage, 10) : null;
      data.fuelType = sanitizeFuelType(fuelType);
      data.transmission = sanitizeTransmission(transmission);
      data.engineCapacity = engineCapacity ? parseInt(engineCapacity, 10) : null;
      data.color = color || null;
      data.seats = seats ? parseInt(seats, 10) : null;
      data.engineType = engineType || null;
      data.horsepower = horsepower ? parseInt(horsepower, 10) : null;
      data.torque = torque ? parseInt(torque, 10) : null;
      data.fuelEconomy = fuelEconomy ? parseFloat(fuelEconomy) : null;
      data.topSpeed = topSpeed ? parseInt(topSpeed, 10) : null;
      data.variant = variant || null;
      data.interiorColor = interiorColor || null;
      data.drivetrain = drivetrain || null;
      data.plateNumber = plateNumber || null;
      data.vinNumber = vinNumber || null;
      data.features = features || null;
      data.safetyFeatures = safetyFeatures || null;
      data.overallCondition = overallCondition || null;
      data.accidentHistory = accidentHistory != null ? Boolean(accidentHistory) : null;
      data.serviceHistoryAvailable = serviceHistoryAvailable != null ? Boolean(serviceHistoryAvailable) : null;
      data.previousOwners = previousOwners ? parseInt(previousOwners, 10) : null;
      data.lastMaintenanceDate = lastMaintenanceDate || null;
      data.tiresCondition = tiresCondition || null;
      data.knownIssues = knownIssues || null;
      data.ownershipDetails = ownershipDetails || null;
    }

    // Shared selling details (any category)
    data.negotiable = negotiable != null ? Boolean(negotiable) : false;
    data.reasonForSelling = reasonForSelling || null;
    data.viewingAvailability = viewingAvailability || null;

    if (category === 'RealEstate') {
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

    const listing = await prisma.listing.create({ data });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_SUBMITTED',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    // Notify admins of new listing
    if (!isAdmin) {
      const io = req.app.get('io');
      createNotification({
        type: 'NEW_LISTING',
        title: 'New Listing Submitted',
        message: `${req.user.name} submitted a new ${category} listing: "${listing.title}".`,
        metadata: { listingId: listing.id, category },
        io,
      });
    }

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
      brand, model, bodyType,
      year, mileage, fuelType, transmission, engineCapacity, color, seats,
      engineType, horsepower, torque, fuelEconomy, topSpeed,
      variant, interiorColor, drivetrain, plateNumber, vinNumber,
      features, safetyFeatures,
      overallCondition, accidentHistory, serviceHistoryAvailable,
      previousOwners, lastMaintenanceDate, tiresCondition, knownIssues,
      ownershipDetails,
      negotiable, reasonForSelling, viewingAvailability,
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
    if (category || brand || model || year) {
      const newTitle = generateTitle({
        category: effectiveCategory,
        vehicleSubtype: vehicleSubtype || listing.vehicleSubtype,
        realEstateSubtype: realEstateSubtype || listing.realEstateSubtype,
        year: year ? parseInt(year, 10) : listing.year,
        brand: brand || listing.brand,
        model: model || listing.model,
        city: city || listing.city,
      });
      updateData.title = newTitle;
      updateData.slug = `${slugify(newTitle, { lower: true, strict: true })}-${Date.now().toString(36)}`;
    }

    // Vehicle fields
    if (effectiveCategory === 'Vehicle') {
      updateData.vehicleSubtype = vehicleSubtype || listing.vehicleSubtype;
      updateData.brand = brand !== undefined ? (brand || null) : listing.brand;
      updateData.model = model !== undefined ? (model || null) : listing.model;
      updateData.bodyType = bodyType !== undefined ? (bodyType || null) : listing.bodyType;
      updateData.year = year ? parseInt(year, 10) : listing.year;
      updateData.mileage = mileage !== undefined ? (mileage ? parseInt(mileage, 10) : null) : listing.mileage;
      updateData.fuelType = sanitizeFuelType(fuelType) || listing.fuelType;
      updateData.transmission = sanitizeTransmission(transmission) || listing.transmission;
      updateData.engineCapacity = engineCapacity !== undefined ? (engineCapacity ? parseInt(engineCapacity, 10) : null) : listing.engineCapacity;
      updateData.color = color !== undefined ? color : listing.color;
      updateData.seats = seats !== undefined ? (seats ? parseInt(seats, 10) : null) : listing.seats;
      updateData.engineType = engineType !== undefined ? (engineType || null) : listing.engineType;
      updateData.horsepower = horsepower !== undefined ? (horsepower ? parseInt(horsepower, 10) : null) : listing.horsepower;
      updateData.torque = torque !== undefined ? (torque ? parseInt(torque, 10) : null) : listing.torque;
      updateData.fuelEconomy = fuelEconomy !== undefined ? (fuelEconomy ? parseFloat(fuelEconomy) : null) : listing.fuelEconomy;
      updateData.topSpeed = topSpeed !== undefined ? (topSpeed ? parseInt(topSpeed, 10) : null) : listing.topSpeed;
      updateData.variant = variant !== undefined ? (variant || null) : listing.variant;
      updateData.interiorColor = interiorColor !== undefined ? (interiorColor || null) : listing.interiorColor;
      updateData.drivetrain = drivetrain !== undefined ? (drivetrain || null) : listing.drivetrain;
      updateData.plateNumber = plateNumber !== undefined ? (plateNumber || null) : listing.plateNumber;
      updateData.vinNumber = vinNumber !== undefined ? (vinNumber || null) : listing.vinNumber;
      updateData.features = features !== undefined ? (features || null) : listing.features;
      updateData.safetyFeatures = safetyFeatures !== undefined ? (safetyFeatures || null) : listing.safetyFeatures;
      updateData.overallCondition = overallCondition !== undefined ? (overallCondition || null) : listing.overallCondition;
      updateData.accidentHistory = accidentHistory !== undefined ? (accidentHistory != null ? Boolean(accidentHistory) : null) : listing.accidentHistory;
      updateData.serviceHistoryAvailable = serviceHistoryAvailable !== undefined ? (serviceHistoryAvailable != null ? Boolean(serviceHistoryAvailable) : null) : listing.serviceHistoryAvailable;
      updateData.previousOwners = previousOwners !== undefined ? (previousOwners ? parseInt(previousOwners, 10) : null) : listing.previousOwners;
      updateData.lastMaintenanceDate = lastMaintenanceDate !== undefined ? (lastMaintenanceDate || null) : listing.lastMaintenanceDate;
      updateData.tiresCondition = tiresCondition !== undefined ? (tiresCondition || null) : listing.tiresCondition;
      updateData.knownIssues = knownIssues !== undefined ? (knownIssues || null) : listing.knownIssues;
      updateData.ownershipDetails = ownershipDetails !== undefined ? (ownershipDetails || null) : listing.ownershipDetails;
    }

    // Shared selling details
    updateData.negotiable = negotiable !== undefined ? Boolean(negotiable) : listing.negotiable;
    updateData.reasonForSelling = reasonForSelling !== undefined ? (reasonForSelling || null) : listing.reasonForSelling;
    updateData.viewingAvailability = viewingAvailability !== undefined ? (viewingAvailability || null) : listing.viewingAvailability;

    if (effectiveCategory === 'RealEstate') {
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
      const { publicId, url } = await uploadImageLocal(file.buffer);
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

    deleteLocalFile(image.publicId, 'image');
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
// Similar Listings
// ============================================================

/**
 * GET /api/listings/:id/similar — Public: find similar listings.
 */
async function getSimilarListings(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing || listing.isDeleted || listing.status !== 'Approved') {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const baseWhere = {
      id: { not: listing.id },
      isDeleted: false,
      status: 'Approved',
      category: listing.category,
    };

    // Build OR conditions for relevance
    const orConditions = [];

    if (listing.category === 'Vehicle') {
      // Same brand + model
      if (listing.brand && listing.model) {
        orConditions.push({ brand: listing.brand, model: listing.model });
      }
      // Same brand only
      if (listing.brand) {
        orConditions.push({ brand: listing.brand });
      }
      // Same body type
      if (listing.bodyType) {
        orConditions.push({ bodyType: listing.bodyType });
      }
    }

    // Same price range (±20%)
    const price = parseFloat(listing.price);
    if (price > 0) {
      orConditions.push({
        price: {
          gte: price * 0.8,
          lte: price * 1.2,
        },
      });
    }

    const where = orConditions.length > 0
      ? { ...baseWhere, OR: orConditions }
      : baseWhere;

    const similar = await prisma.listing.findMany({
      where,
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        city: true,
        mileage: true,
        year: true,
        brand: true,
        model: true,
        bodyType: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    res.json(similar);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// Helpers
// ============================================================

function generateTitle({ category, vehicleSubtype, realEstateSubtype, year, brand, model, city }) {
  if (category === 'Vehicle' && brand && model) {
    return `${year || ''} ${brand} ${model}`.trim();
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
  if (query.brand) where.brand = { contains: query.brand };
  if (query.model) where.model = { contains: query.model };
  if (query.vehicleType) where.bodyType = { contains: query.vehicleType };
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
  getSimilarListings,
};
