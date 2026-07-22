db = db.getSiblingDB("momo");

// Nettoyage avant nouvelle génération
db.agents.deleteMany({});

const firstNames = [
    "Mamadou", "Ibrahima", "Ousmane", "Cheikh", "Abdoulaye",
    "Moussa", "Pape", "Serigne", "Babacar", "Amadou",
    "Awa", "Fatou", "Mariama", "Khady", "Aminata",
    "Ndeye", "Astou", "Rokhaya", "Coumba", "Adama"
];

const lastNames = [
    "Diop", "Ndiaye", "Fall", "Sow", "Ba",
    "Diallo", "Sarr", "Sy", "Seck", "Faye",
    "Kane", "Cissé", "Ndao", "Mbaye", "Gueye"
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
        "Dépot",
        "Quinzambougou"
    ],
    Kolda: [
        "Sikilo",
        "Doumassou",
        "Gadapara"
    ]
};

const agentStatuses = [
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
        2000000 + (index % 7000000)
    ).padStart(7, "0");

    return "221" + prefix + subscriberNumber;
}

const agents = [];

for (let i = 1; i <= 500; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const city = getRandomItem(cities);
    const district = getRandomItem(districtsByCity[city]);
    const status = getRandomItem(agentStatuses);

    agents.push({
        agentId: i,
        agentCode: "AGT-" + String(i).padStart(5, "0"),
        fullName: firstName + " " + lastName,
        phoneNumber: generatePhoneNumber(i),
        city: city,
        district: district,
        address: district + ", " + city,
        cashBalance: Number((50000 + Math.random() * 950000).toFixed(2)),
        electronicBalance: Number((50000 + Math.random() * 1950000).toFixed(2)),
        currency: "XOF",
        agentStatus: status,
        dailyTransactionLimit: 5000000,
        registeredAt: new Date(
            Date.now() -
            Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)
        )
    });
}

db.agents.insertMany(agents);

db.agents.createIndex(
    { agentId: 1 },
    { unique: true }
);

db.agents.createIndex(
    { agentCode: 1 },
    { unique: true }
);

db.agents.createIndex(
    { phoneNumber: 1 },
    { unique: true }
);

db.agents.createIndex(
    { city: 1 }
);

db.agents.createIndex(
    { agentStatus: 1 }
);

print(db.agents.countDocuments() + " agents sénégalais générés.");