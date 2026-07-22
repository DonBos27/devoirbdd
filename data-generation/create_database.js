// Sélection de la base de données
db = db.getSiblingDB("momo");

// Activation du sharding sur la base
sh.enableSharding("momo");

// Création des collections
db.createCollection("users");
db.createCollection("agents");
db.createCollection("merchants");
db.createCollection("transactions");

// Création d’un index hashed sur la clé de sharding
db.transactions.createIndex({ senderPhone: "hashed" });

// Activation du sharding sur la collection transactions
sh.shardCollection(
  "momo.transactions",
  { senderPhone: "hashed" }
);

print("Base momo créée avec succès.");
print("Collections créées : users, agents, merchants, transactions.");
print("La collection transactions est shardée sur senderPhone.");
