db = db.getSiblingDB("momo");

// Nettoyage avant une nouvelle génération
db.transactions.deleteMany({});

const TOTAL_TRANSACTIONS = 100000;
const BATCH_SIZE = 5000;

const transactionTypes = [
    "TRANSFER",
    "TRANSFER",
    "TRANSFER",
    "CASH_IN",
    "CASH_OUT",
    "MERCHANT_PAYMENT"
];

const transactionStatuses = [
    "SUCCESS",
    "SUCCESS",
    "SUCCESS",
    "SUCCESS",
    "PENDING",
    "FAILED"
];

const channels = [
    "MOBILE_APP",
    "USSD",
    "AGENT",
    "QR_CODE"
];

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function getRandomDate() {
    const oneYearInMilliseconds =
        365 * 24 * 60 * 60 * 1000;

    return new Date(
        Date.now() -
        Math.floor(Math.random() * oneYearInMilliseconds)
    );
}

// Chargement des références existantes
const users = db.users.find(
    {},
    {
        _id: 0,
        userId: 1,
        phoneNumber: 1,
        city: 1
    }
).toArray();

const agents = db.agents.find(
    {},
    {
        _id: 0,
        agentId: 1,
        agentCode: 1,
        phoneNumber: 1,
        city: 1
    }
).toArray();

const merchants = db.merchants.find(
    {},
    {
        _id: 0,
        merchantId: 1,
        merchantCode: 1,
        phoneNumber: 1,
        city: 1
    }
).toArray();

if (users.length === 0) {
    throw new Error(
        "La collection users est vide. Exécute generate_users.js."
    );
}

if (agents.length === 0) {
    throw new Error(
        "La collection agents est vide. Exécute generate_agents.js."
    );
}

if (merchants.length === 0) {
    throw new Error(
        "La collection merchants est vide. Exécute generate_merchants.js."
    );
}

function createTransaction(index) {
    const type = getRandomItem(transactionTypes);
    const status = getRandomItem(transactionStatuses);
    const sender = getRandomItem(users);

    let receiverPhone = null;
    let receiverType = null;
    let receiverId = null;
    let agentCode = null;
    let merchantCode = null;
    let channel = getRandomItem(channels);

    let amount;

    switch (type) {
        case "TRANSFER": {
            let receiver = getRandomItem(users);

            // Éviter que l’expéditeur soit aussi le destinataire
            while (receiver.userId === sender.userId) {
                receiver = getRandomItem(users);
            }

            receiverPhone = receiver.phoneNumber;
            receiverType = "USER";
            receiverId = receiver.userId;
            amount = getRandomAmount(500, 250000);
            channel = getRandomItem(["MOBILE_APP", "USSD"]);
            break;
        }

        case "CASH_IN": {
            const agent = getRandomItem(agents);

            receiverPhone = sender.phoneNumber;
            receiverType = "USER";
            receiverId = sender.userId;
            agentCode = agent.agentCode;
            amount = getRandomAmount(1000, 500000);
            channel = "AGENT";
            break;
        }

        case "CASH_OUT": {
            const agent = getRandomItem(agents);

            receiverPhone = agent.phoneNumber;
            receiverType = "AGENT";
            receiverId = agent.agentId;
            agentCode = agent.agentCode;
            amount = getRandomAmount(1000, 300000);
            channel = "AGENT";
            break;
        }

        case "MERCHANT_PAYMENT": {
            const merchant = getRandomItem(merchants);

            receiverPhone = merchant.phoneNumber;
            receiverType = "MERCHANT";
            receiverId = merchant.merchantId;
            merchantCode = merchant.merchantCode;
            amount = getRandomAmount(500, 200000);
            channel = getRandomItem([
                "MOBILE_APP",
                "USSD",
                "QR_CODE"
            ]);
            break;
        }
    }

    const fee =
        type === "TRANSFER" || type === "CASH_OUT"
            ? Math.round(amount * 0.01)
            : 0;

    return {
        transactionId:
            "TXN-" + String(index).padStart(10, "0"),

        transactionType: type,

        senderId: sender.userId,
        senderPhone: sender.phoneNumber,

        receiverId: receiverId,
        receiverPhone: receiverPhone,
        receiverType: receiverType,

        agentCode: agentCode,
        merchantCode: merchantCode,

        amount: amount,
        fee: fee,
        totalAmount: amount + fee,
        currency: "XOF",

        channel: channel,
        status: status,

        city: sender.city,

        transactionDate: getRandomDate(),

        metadata: {
            country: "Sénégal",
            countryCode: "SN",
            platform: "G4Pay"
        }
    };
}

let insertedTransactions = 0;

for (
    let start = 1;
    start <= TOTAL_TRANSACTIONS;
    start += BATCH_SIZE
) {
    const batch = [];

    const end = Math.min(
        start + BATCH_SIZE - 1,
        TOTAL_TRANSACTIONS
    );

    for (let i = start; i <= end; i++) {
        batch.push(createTransaction(i));
    }

    db.transactions.insertMany(batch);

    insertedTransactions += batch.length;

    print(
        insertedTransactions +
        " / " +
        TOTAL_TRANSACTIONS +
        " transactions insérées."
    );
}

// Index utiles pour les recherches et analyses
db.transactions.createIndex({ transactionId: 1 });

db.transactions.createIndex({
    senderPhone: 1,
    transactionDate: -1
});

db.transactions.createIndex({
    transactionType: 1,
    transactionDate: -1
});

db.transactions.createIndex({
    status: 1
});

db.transactions.createIndex({
    city: 1
});

db.transactions.createIndex({
    receiverPhone: 1
});

print(
    db.transactions.countDocuments() +
    " transactions sénégalaises générées."
);