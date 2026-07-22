db = db.getSiblingDB("momo");

// Nettoyage de la collection avant une nouvelle génération
db.users.deleteMany({});

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

const mobilePrefixes = [
  "70",
  "75",
  "76",
  "77",
  "78"
];

const accountStatuses = [
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "SUSPENDED"
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function removeAccents(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generatePhoneNumber(index) {
  const prefix = getRandomItem(mobilePrefixes);

  const subscriberNumber = String(
    1000000 + (index % 9000000)
  ).padStart(7, "0");

  return "221" + prefix + subscriberNumber;
}

const users = [];

for (let i = 1; i <= 10000; i++) {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const city = getRandomItem(cities);
  const accountStatus = getRandomItem(accountStatuses);

  const normalizedFirstName = removeAccents(firstName).toLowerCase();
  const normalizedLastName = removeAccents(lastName).toLowerCase();

  users.push({
    userId: i,
    firstName: firstName,
    lastName: lastName,
    fullName: firstName + " " + lastName,
    phoneNumber: generatePhoneNumber(i),
    email:
      normalizedFirstName +
      "." +
      normalizedLastName +
      i +
      "@g4pay.sn",
    city: city,
    balance: Number((Math.random() * 500000).toFixed(2)),
    currency: "XOF",
    accountStatus: accountStatus,
    createdAt: new Date(
      Date.now() -
      Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    )
  });
}

// Insertion en une seule opération 
db.users.insertMany(users);

// Création d'index 
db.users.createIndex(
  { userId: 1 },
  { unique: true }
);

db.users.createIndex(
  { phoneNumber: 1 },
  { unique: true }
);

db.users.createIndex(
  { email: 1 },
  { unique: true }
);

db.users.createIndex(
  { city: 1 }
);

print(db.users.countDocuments() + " utilisateurs sénégalais générés.");