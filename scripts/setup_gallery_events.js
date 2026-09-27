const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('../data/db');

async function setupGalleryAndEvents() {
  console.log('🚀 Processing Event & Gallery images...');

  const rootDir = path.join(__dirname, '..');
  const baseGallery = path.join(rootDir, 'Update', 'Update', 'Gallery Page');
  const srcIit = path.join(baseGallery, 'Tech Expo -RoboVed at Sreenidhi University');
  const srcAmity = path.join(baseGallery, 'Amity University Bombay');

  const destIitDir = path.join(rootDir, 'public', 'assets', 'events', 'iit_hyderabad');
  const destAmityDir = path.join(rootDir, 'public', 'assets', 'events', 'amity_bombay');

  if (!fs.existsSync(destIitDir)) fs.mkdirSync(destIitDir, { recursive: true });
  if (!fs.existsSync(destAmityDir)) fs.mkdirSync(destAmityDir, { recursive: true });

  // 1. Process Tech Expo IIT Hyderabad Photos
  // Main photo: WhatsApp Image 2026-09-24.jpeg
  // 6 inside photos: IIt Hyderabad.jpeg, WhatsApp Image 2026-09-24 at 4.03.52 PM.jpeg, WhatsApp Image 2026-09-24 at 4.04.04 PM.jpeg, WhatsApp Image 2026-09-24 at 4.04.05 PM.jpeg, sreenidhi.jpeg, Screenshot 2026-09-24 160218.png
  const iitFiles = [
    { src: 'WhatsApp Image 2026-09-24.jpeg', dest: 'main_cover.webp', isMain: true },
    { src: 'IIt Hyderabad.jpeg', dest: 'iit_hyd_1.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 4.03.52 PM.jpeg', dest: 'iit_hyd_2.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 4.04.04 PM.jpeg', dest: 'iit_hyd_3.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 4.04.05 PM.jpeg', dest: 'iit_hyd_4.webp' },
    { src: 'sreenidhi.jpeg', dest: 'iit_hyd_5.webp' },
    { src: 'Screenshot 2026-09-24 160218.png', dest: 'iit_hyd_6.webp' }
  ];

  const iitPhotoUrls = [];
  for (const item of iitFiles) {
    const srcPath = path.join(srcIit, item.src);
    const destPath = path.join(destIitDir, item.dest);
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(destPath);
      const publicUrl = `/assets/events/iit_hyderabad/${item.dest}`;
      iitPhotoUrls.push(publicUrl);
      console.log(`✅ Saved IIT Hyderabad photo: ${item.dest}`);
    } else {
      console.warn(`⚠️ Not found: ${srcPath}`);
    }
  }

  // 2. Process Amity University Bombay Photos
  // Main photo: WhatsApp Image 2026-09-24 at 12.47.26 PM (1).jpeg
  // 5 inside photos
  const amityFiles = [
    { src: 'WhatsApp Image 2026-09-24 at 12.47.26 PM (1).jpeg', dest: 'main_cover.webp', isMain: true },
    { src: 'WhatsApp Image 2026-09-24 at 12.47.26 PM.jpeg', dest: 'amity_1.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 12.47.27 PM (1).jpeg', dest: 'amity_2.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 12.47.27 PM.jpeg', dest: 'amity_3.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 12.47.28 PM (1).jpeg', dest: 'amity_4.webp' },
    { src: 'WhatsApp Image 2026-09-24 at 12.47.28 PM.jpeg', dest: 'amity_5.webp' }
  ];

  const amityPhotoUrls = [];
  for (const item of amityFiles) {
    const srcPath = path.join(srcAmity, item.src);
    const destPath = path.join(destAmityDir, item.dest);
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(destPath);
      const publicUrl = `/assets/events/amity_bombay/${item.dest}`;
      amityPhotoUrls.push(publicUrl);
      console.log(`✅ Saved Amity Bombay photo: ${item.dest}`);
    } else {
      console.warn(`⚠️ Not found: ${srcPath}`);
    }
  }

  // 3. Update Events in Database
  let currentEvents = db.get('events') || [];
  
  const iitEvent = {
    id: 'event-tech-expo-iit-hyderabad',
    title: 'Tech Expo IIT Hyderabad',
    slug: 'tech-expo-iit-hyderabad',
    category: 'Competitions',
    type: 'past',
    date: 'Tech Expo 2026',
    timings: '8:30 AM to 5:30 PM',
    location: 'IIT Hyderabad Campus & Innovation Arenas',
    shortDescription: 'Grand robotics innovation exhibition and hardware prototype showcase featuring autonomous rovers, drones, and smart IoT systems.',
    description: 'Students and research mentors at Edueme Research Labs showcased breakthrough autonomous robots, Embedded C microcontroller solutions, and AI decision agents during the premier Tech Expo IIT Hyderabad. The exhibition brought together engineering scholars, university professors, and school innovators for live testing and hardware demonstrations.',
    image: iitPhotoUrls[0] || '/assets/events_hero.jpg',
    photos: iitPhotoUrls,
    highlights: [
      'Showcase of Autonomous Robotics & Embedded C Systems',
      'Interactive Live Drone & Rover Demonstration Arena',
      'Research Interactions with University Faculty',
      'Student Innovation Awards & Recognition'
    ],
    status: 'active',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  };

  const amityEvent = {
    id: 'event-amity-university-bombay',
    title: 'Amity University Bombay',
    slug: 'amity-university-bombay',
    category: 'Tech Tours',
    type: 'past',
    date: 'Innovation Summit 2026',
    timings: '8:30 AM to 5:30 PM',
    location: 'Amity University Campus, Mumbai',
    shortDescription: 'National STEM immersion and university lab delegation featuring hands-on electronics workshops and rapid hardware prototyping.',
    description: 'Edueme research scholars visited and demonstrated advanced robotics kits, AI vision classifiers, and rapid prototyping workflows at Amity University Bombay. The event fostered cross-institutional knowledge exchange in emerging technology and experiential learning.',
    image: amityPhotoUrls[0] || '/assets/events_hero.jpg',
    photos: amityPhotoUrls,
    highlights: [
      'Comprehensive Hands-on Robotics & AI Demos',
      'University Lab Tours & Innovation Facilities',
      'Mentorship Sessions with Lead Roboticists',
      'Student Hardware Prototyping Showcase'
    ],
    status: 'active',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  };

  // Filter out existing duplicates of these events and prepend them at the top
  currentEvents = currentEvents.filter(e => e.id !== iitEvent.id && e.slug !== iitEvent.slug && e.id !== amityEvent.id && e.slug !== amityEvent.slug);
  currentEvents.unshift(amityEvent);
  currentEvents.unshift(iitEvent);

  // Re-order displayOrder
  currentEvents.forEach((ev, idx) => {
    ev.displayOrder = idx + 1;
  });

  db.set('events', currentEvents);
  console.log('✅ Events database updated with Tech Expo IIT Hyderabad & Amity University Bombay!');

  // 4. Update Gallery in Database
  let currentGallery = db.get('gallery') || [];
  const newGalleryItems = [
    {
      id: 'gal-iit-1',
      title: 'Tech Expo IIT Hyderabad — Main Arena Showcase',
      category: 'Competitions',
      imageUrl: iitPhotoUrls[0] || '/assets/events_hero.jpg',
      status: 'active',
      displayOrder: 1
    },
    {
      id: 'gal-iit-2',
      title: 'Tech Expo IIT Hyderabad — Project Exhibition',
      category: 'Workshops',
      imageUrl: iitPhotoUrls[1] || iitPhotoUrls[0],
      status: 'active',
      displayOrder: 2
    },
    {
      id: 'gal-amity-1',
      title: 'Amity University Bombay — STEM Delegation',
      category: 'Tech Tours',
      imageUrl: amityPhotoUrls[0] || '/assets/events_hero.jpg',
      status: 'active',
      displayOrder: 3
    },
    {
      id: 'gal-amity-2',
      title: 'Amity University Bombay — Mentorship & Prototyping',
      category: 'Workshops',
      imageUrl: amityPhotoUrls[1] || amityPhotoUrls[0],
      status: 'active',
      displayOrder: 4
    }
  ];

  currentGallery = currentGallery.filter(g => !g.id.startsWith('gal-iit') && !g.id.startsWith('gal-amity'));
  currentGallery.unshift(...newGalleryItems);
  db.set('gallery', currentGallery);
  console.log('✅ Gallery database updated with Tech Expo IIT Hyderabad & Amity University Bombay!');

  console.log('🎉 Processing and Database update complete!');
}

setupGalleryAndEvents().catch(err => console.error('Setup error:', err));
