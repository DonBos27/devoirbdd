# G_4_Pay — Architecture MongoDB distribuée:  (Sharding STEPS)

Projet Master I — IA · Bases de données (De SQL à NoSQL). Déploiement **réel** d'un cluster
MongoDB 8.0 shardé sur le domaine d'une plateforme de
mobile money ouest-africaine (**G_4_Pay**).

#### Il s'agit d'expliquer principalement les etapes suivies pour obtenir la base mongo avec les collections telles que discutées. Pour le coté realiste de la chose,on a principalement 4 collections mais une seule est shardée (transaction) pour simple raison que les autres (users,merchants et agents) ne sont pas trop volumineuses et donc c'est encore gerable 

## 1- Creation de l' Arborescence (MAC OS ) -- reajuster pour windows
``` bash Apres que toutes les instances mongo soient installées , utiliser les commandes suivantes:
mkdir -p ~/mongo-cluster/{configsvr,shard1,shard2,shard3,shard4,logs}
```
## 2- Lancer le replica set de config servers (port 27019) 
 
nohup mongod --configsvr --replSet configReplSet --port 27019 \
  --dbpath ~/mongo-cluster/configsvr \
  --logpath ~/mongo-cluster/logs/configsvr.log > /dev/null 2>&1 &

## 3- Initialisation (dans un mongosh connecté sur ce port) 

mongosh --port 27019 --eval '
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [{ _id: 0, host: "localhost:27019" }]
})'

## 4- Pour les 4 shards

nohup mongod --shardsvr --replSet shard1ReplSet --port 27018 --dbpath ~/mongo-cluster/shard1 --logpath ~/mongo-cluster/logs/shard1.log > /dev/null 2>&1 &
nohup mongod --shardsvr --replSet shard2ReplSet --port 27020 --dbpath ~/mongo-cluster/shard2 --logpath ~/mongo-cluster/logs/shard2.log > /dev/null 2>&1 &
nohup mongod --shardsvr --replSet shard3ReplSet --port 27021 --dbpath ~/mongo-cluster/shard3 --logpath ~/mongo-cluster/logs/shard3.log > /dev/null 2>&1 &
nohup mongod --shardsvr --replSet shard4ReplSet --port 27022 --dbpath ~/mongo-cluster/shard4 --logpath ~/mongo-cluster/logs/shard4.log > /dev/null 2>&1 &

## 5 - Initialisation de chaque replica set : (Etant donnée que j'ai deja  le port 27019 sous ecoute )
mongosh --port 27018 --eval 'rs.initiate({_id:"shard1ReplSet", members:[{_id:0, host:"localhost:27018"}]})'
mongosh --port 27020 --eval 'rs.initiate({_id:"shard2ReplSet", members:[{_id:0, host:"localhost:27020"}]})'
mongosh --port 27021 --eval 'rs.initiate({_id:"shard3ReplSet", members:[{_id:0, host:"localhost:27021"}]})'
mongosh --port 27022 --eval 'rs.initiate({_id:"shard4ReplSet", members:[{_id:0, host:"localhost:27022"}]})'

## 6- Le routeurs mongos

nohup mongos --configdb configReplSet/localhost:27019 --port 27017 \
  --logpath ~/mongo-cluster/logs/mongos.log > /dev/null 2>&1 &

mongosh --port 27017

## 7- Ajouter les shards

sh.addShard("shard1ReplSet/localhost:27018")
sh.addShard("shard2ReplSet/localhost:27020")
sh.addShard("shard3ReplSet/localhost:27021")
sh.addShard("shard4ReplSet/localhost:27022")

sh.status()

# 8- Code JS pour Generer la collection user

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomPhone() {
  const prefixes = ["225", "221", "229", "226"];
  return "+" + randomChoice(prefixes) + randomInt(10000000, 99999999);
}
function randomDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }

const operators = ["Wave", "Orange Money", "MTN MoMo", "Moov Money"];
const firstNames = ["Aminata", "Kouassi", "Fatou", "Ibrahim", "Aissatou", "Moussa", "Adjoa", "Seydou", "Mariam", "Yao"];
const lastNames = ["Traore", "Diallo", "Kone", "Ouattara", "Sanogo", "Toure", "Coulibaly", "Bamba", "Diarra", "Kabore"];

const NB_USERS = 5000;
let users = [];

for (let i = 0; i < NB_USERS; i++) {
  const initialBalance = randomInt(0, 200000);
  users.push({
    userId: "USR" + i.toString().padStart(6, "0"),
    phone: randomPhone(),
    firstName: randomChoice(firstNames),
    lastName: randomChoice(lastNames),
    operator: randomChoice(operators),
    kycStatus: randomChoice(["verified", "verified", "verified", "pending"]),
    registrationDate: randomDate(new Date("2023-01-01"), new Date("2025-01-01")),
    balance: initialBalance,   // solde courant, mis à jour au fil des transactions
    status: randomChoice(["active", "active", "active", "suspended"])
  });
}
db.users.insertMany(users);
print("Users créés: " + users.length);

# 9- Code JS pour Generer la collection agents

const regions = ["Abidjan", "Bouaké", "Dakar", "Cotonou", "Ouagadougou", "Porto-Novo", "Thiès", "Yamoussoukro"];

const NB_AGENTS = 300;
let agents = [];

for (let i = 0; i < NB_AGENTS; i++) {
  agents.push({
    agentId: "AGENT" + i.toString().padStart(4, "0"),
    phone: randomPhone(),
    name: "Point Mobile Money " + randomChoice(regions) + " #" + i,
    operator: randomChoice(operators),
    region: randomChoice(regions),
    floatBalance: randomInt(100000, 5000000), // liquidités disponibles pour dépôts/retraits
    status: "active"
  });
}
db.agents.insertMany(agents);
print("Agents créés: " + agents.length);

# 10- Code JS pour Generer la collection merchants

const merchantNames = ["Supermarché Leader", "Pharmacie du Plateau", "Station Total", "Restaurant Chez Tantie", "Boutique Mode", "Cyber Café Plus", "Marché Central", "Librairie Savoir"];

const NB_MERCHANTS = 500;
let merchants = [];

for (let i = 0; i < NB_MERCHANTS; i++) {
  merchants.push({
    merchantId: "MARCHAND" + i.toString().padStart(4, "0"),
    name: randomChoice(merchantNames) + " " + i,
    category: randomChoice(["Alimentation", "Santé", "Carburant", "Restauration", "Commerce", "Services", "Education"]),
    region: randomChoice(regions),
    status: "active"
  });
}
db.merchants.insertMany(merchants);
print("Merchants créés: " + merchants.length);

# 11-  Préparer le sharding de transactions (collection vide, donc pré-répartition automatique)

sh.enableSharding("momo")
db.transactions.createIndex({ senderPhone: "hashed" })
sh.shardCollection("momo.transactions", { senderPhone: "hashed" })
## 12- Générer transactions
Transaction table // Charger tous les users en mémoire pour un accès rapide

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 5) * 5;
}

const allUsers = db.users.find({}, { userId: 1, phone: 1, balance: 1 }).toArray();
const userBalances = {};       // phone -> solde courant
const phoneToUserId = {};
allUsers.forEach(u => {
  userBalances[u.phone] = u.balance;
  phoneToUserId[u.phone] = u.userId;
});

const userPhones = allUsers.map(u => u.phone);
const allAgents = db.agents.find({}, { agentId: 1 }).toArray().map(a => a.agentId);
const allMerchants = db.merchants.find({}, { merchantId: 1 }).toArray().map(m => m.merchantId);

const transactionTypes = ["depot", "retrait", "transfert_p2p", "paiement_marchand", "achat_credit", "paiement_facture"];
const factureTypes = ["SBEE", "SONEB", "Canal+", "CIE", "SODECI"];

function randomAmount(min, max) { return Math.round((Math.random() * (max - min) + min) / 5) * 5; }

const NB_TRANSACTIONS = 200000;
const BATCH_SIZE = 1000;

// Générer les dates d'abord, puis TRIER chronologiquement pour que l'évolution du solde ait du sens
let rawEvents = [];
for (let i = 0; i < NB_TRANSACTIONS; i++) {
  rawEvents.push({
    date: randomDate(new Date("2025-01-01"), new Date("2026-07-05")),
    type: randomChoice(transactionTypes)
  });
}
rawEvents.sort((a, b) => a.date - b.date);

let batch = [];
let inserted = 0;

rawEvents.forEach((event, i) => {
  const type = event.type;
  const senderPhone = randomChoice(userPhones);
  const currentBalance = userBalances[senderPhone];

  let receiverPhone = null, agentId = null, merchantId = null, factureType = null;
  let amount, fee = 0, status;
  let balanceBefore = currentBalance;
  let balanceAfter = currentBalance;

  if (type === "depot") {
    agentId = randomChoice(allAgents);
    amount = randomAmount(1000, 200000);
    fee = 0; // dépôt gratuit, standard mobile money
    balanceAfter = balanceBefore + amount;
    status = "completed";

  } else if (type === "retrait") {
    agentId = randomChoice(allAgents);
    amount = randomAmount(500, Math.min(currentBalance, 150000) || 500);
    fee = Math.round(amount * 0.015);
    if (amount + fee <= currentBalance) {
      balanceAfter = balanceBefore - amount - fee;
      status = "completed";
    } else {
      status = "failed"; // solde insuffisant
    }

  } else if (type === "transfert_p2p") {
    let receiverPhone;

do {
    receiverPhone = randomChoice(userPhones);
} while (receiverPhone === senderPhone);
    amount = randomAmount(500, Math.min(currentBalance, 100000) || 500);
    fee = Math.round(amount * 0.01);
    if (amount + fee <= currentBalance) {
      balanceAfter = balanceBefore - amount - fee;
      userBalances[receiverPhone] += amount; // le destinataire est crédité
      status = "completed";
    } else {
      status = "failed";
    }

  } else if (type === "paiement_marchand") {
    merchantId = randomChoice(allMerchants);
    amount = randomAmount(500, Math.min(currentBalance, 80000) || 500);
    fee = Math.round(amount * 0.005);
    if (amount + fee <= currentBalance) {
      balanceAfter = balanceBefore - amount - fee;
      status = "completed";
    } else {
      status = "failed";
    }

  } else if (type === "achat_credit") {
    amount = randomAmount(100, Math.min(currentBalance, 10000) || 100);
    fee = 0;
    if (amount <= currentBalance) {
      balanceAfter = balanceBefore - amount;
      status = "completed";
    } else {
      status = "failed";
    }

  } else { // paiement_facture
    factureType = randomChoice(factureTypes);
    amount = randomAmount(1000, Math.min(currentBalance, 60000) || 1000);
    fee = Math.round(amount * 0.005);
    if (amount + fee <= currentBalance) {
      balanceAfter = balanceBefore - amount - fee;
      status = "completed";
    } else {
      status = "failed";
    }
  }

  // Mettre à jour le solde de l'expéditeur uniquement si la transaction a réussi
  if (status === "completed") {
    userBalances[senderPhone] = balanceAfter;
  } else {
    balanceAfter = balanceBefore; // solde inchangé si échec
  }

  batch.push({
    transactionId: UUID(),
    type: type,
    senderPhone: senderPhone,
    senderId: phoneToUserId[senderPhone],
    receiverPhone: receiverPhone,
    receiverId: receiverPhone ? phoneToUserId[receiverPhone] : null,
    agentId: agentId,
    merchantId: merchantId,
    factureType: factureType,
    amount: amount,
    fee: fee,
    currency: "XOF",
    status: status,
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    channel: randomChoice(["USSD", "App mobile", "Agent"]),
    transactionDate: event.date,
    createdAt: new Date()
  });

  if (batch.length === BATCH_SIZE) {
    db.transactions.insertMany(batch);
    inserted += batch.length;
    batch = [];
    if (inserted % 20000 === 0) print("Insérées: " + inserted);
  }
});

if (batch.length > 0) {
  db.transactions.insertMany(batch);
  inserted += batch.length;
}
print("Total transactions inséré: " + inserted);

// Synchroniser les soldes finaux dans la collection users
let bulkOps = Object.keys(userBalances).map(phone => ({
  updateOne: {
    filter: { phone: phone },
    update: { $set: { balance: userBalances[phone] } }
  }
}));
db.users.bulkWrite(bulkOps);
print("Soldes utilisateurs synchronisés.");

## 13- Verifs
db.transactions.getShardDistribution()
db.transactions.countDocuments()
db.users.findOne({ userId: "USR000001" })

## 14 - Creation des index user, agents et merchants

db.users.createIndex({ phone: 1 }, { unique: true })
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ operator: 1 })
db.users.createIndex({ status: 1 })


db.agents.createIndex({ agentId: 1 }, { unique: true })
db.agents.createIndex({ region: 1 })

db.merchants.createIndex({ merchantId: 1 }, { unique: true })
db.merchants.createIndex({ category: 1 })


// Unique sur transactionId (unicité par shard, cf. remarque ci-dessus)
db.transactions.createIndex({ transactionId: 1 }, { unique: true })

// Requêtes fréquentes : historique d'un utilisateur trié par date
db.transactions.createIndex({ senderPhone: 1, transactionDate: -1 })

// Requêtes sur le destinataire (transferts P2P)
db.transactions.createIndex({ receiverPhone: 1, transactionDate: -1 })

// Filtrage par statut (ex: lister les échecs, les en attente)
db.transactions.createIndex({ status: 1, transactionDate: -1 })

// Filtrage par type de transaction
db.transactions.createIndex({ type: 1, transactionDate: -1 })

// Requêtes par marchand (analytique commerçant)
db.transactions.createIndex({ merchantId: 1, transactionDate: -1 })

// Requêtes par agent (suivi des dépôts/retraits)
db.transactions.createIndex({ agentId: 1, transactionDate: -1 })

// Requêtes temporelles globales (dashboards, rapports journaliers)
db.transactions.createIndex({ transactionDate: -1 })

## 14 -Petites requêtes utiles pour valider la cohérence

// Vérifier qu'il n'y a pas de solde négatif après coup
db.users.find({ balance: { $lt: 0 } }).count()   // doit être 0

// Répartition des statuts
db.transactions.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])