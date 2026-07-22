db = db.getSiblingDB("momo");

// Nettoyage de la collection avant une nouvelle génération
db.merchants.deleteMany({});

const businessNames = [
    "Boutique Teranga",
    "Marché Ndiambour",
    "Chez Fatou",
    "Alimentation Baobab",
    "Sunu Market",
    "Dakar Services",
    "Keur Serigne",
    "Commerce Diop",
    "Touba Distribution",
    "Jëf Jël Shop",
    "Sen Boutique",
    "Ndar Commerce",
    "Thiès Express",
    "Casamance Market",
    "Keur Mame Diarra"
];

const categories = [
    "ALIMENTATION",
    "RESTAURATION",
    "TRANSPORT",
    "PHARMACIE",
    "HABILLEMENT",
    "ELECTRONIQUE",
    "SERVICES",
    "TELECOMMUNICATION"
];

const cities = [
    "Dakar",
    "Thiès",
    "Saint-Louis",
    "Kaolack",
    "Ziguinchor",
    "Touba",
    "Mbour",
    "Rufisque",
    "Tambacounda",
    "Kolda"
];

const districtsByCity = {
    Dakar: [
        "Plateau",
        "Parcelles Assainies",
        "Ouakam",
        "Yoff",
        "Médina",
        "Grand-Yoff"
    ],
    Thiès: [
        "Thiès Nord",
        "Thiès Sud",
        "Randoulène"
    ],
    "Saint-Louis": [
        "Sor",
        "Ndar Toute",
        "Guet Ndar"
    ],
    Kaolack: [
        "Léona",
        "Kasnack",
        "Ndorong"
    ],
    Ziguinchor: [
        "Boucotte",
        "Tilène",
        "Kandialang"
    ],
    Touba: [
        "Darou Khoudoss",
        "Madiyana",
        "Ndamatou"
    ],
    Mbour: [
        "Mbour Centre",
        "Grand Mbour",
        "Saly"
    ],
    Rufisque: [
        "Rufisque Centre",
        "Bargny",
        "Sangalkam"
    ],
    Tambacounda: [
        "Liberté",
        "Dépôt",
        "Quinzambougou"
    ],
    Kolda: [
        "Sikilo",
        "Doumassou",
        "Gadapara"
    ]
};

const merchantStatuses = [
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "SUSPENDED"
];

const mobilePrefixes = ["70", "75", "76", "77", "78"];

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber(index) {
    const prefix = getRandomItem(mobilePrefixes);

    const subscriberNumber = String(
        3000000 + (index % 6000000)
    ).padStart(7, "0");

    return "221" + prefix + subscriberNumber;
}

const merchants = [];

for (let i = 1; i <= 300; i++) {
    const businessName =
        getRandomItem(businessNames) + " " + String(i).padStart(3, "0");

    const category = getRandomItem(categories);
    const city = getRandomItem(cities);
    const district = getRandomItem(districtsByCity[city]);
    const status = getRandomItem(merchantStatuses);

    merchants.push({
        merchantId: i,
        merchantCode: "MRC-" + String(i).padStart(5, "0"),
        businessName: businessName,
        category: category,
        phoneNumber: generatePhoneNumber(i),
        city: city,
        district: district,
        address: district + ", " + city,
        balance: Number((Math.random() * 3000000).toFixed(2)),
        currency: "XOF",
        merchantStatus: status,
        dailyPaymentLimit: 10000000,
        registeredAt: new Date(
            Date.now() -
            Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)
        )
    });
}

db.merchants.insertMany(merchants);

// Création des index
db.merchants.createIndex(
    { merchantId: 1 },
    { unique: true }
);

db.merchants.createIndex(
    { merchantCode: 1 },
    { unique: true }
);

db.merchants.createIndex(
    { phoneNumber: 1 },
    { unique: true }
);

db.merchants.createIndex(
    { city: 1 }
);

db.merchants.createIndex(
    { category: 1 }
);

db.merchants.createIndex(
    { merchantStatus: 1 }
);

print(db.merchants.countDocuments() + " commerçants sénégalais générés.");