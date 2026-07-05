#!/bin/bash

BASE_DIR="$(pwd)/mongo-cluster"

mkdir -p "$BASE_DIR"/{configsvr,shard1,shard2,shard3,shard4,logs}

echo "Démarrage du Config Server..."
nohup mongod --configsvr --replSet configReplSet --port 27019 \
  --dbpath "$BASE_DIR/configsvr" \
  --logpath "$BASE_DIR/logs/configsvr.log" \
  --logappend > /dev/null 2>&1 &

sleep 3

echo "Démarrage des 4 Shards..."
nohup mongod --shardsvr --replSet shard1ReplSet --port 27018 \
  --dbpath "$BASE_DIR/shard1" \
  --logpath "$BASE_DIR/logs/shard1.log" \
  --logappend > /dev/null 2>&1 &

nohup mongod --shardsvr --replSet shard2ReplSet --port 27020 \
  --dbpath "$BASE_DIR/shard2" \
  --logpath "$BASE_DIR/logs/shard2.log" \
  --logappend > /dev/null 2>&1 &

nohup mongod --shardsvr --replSet shard3ReplSet --port 27021 \
  --dbpath "$BASE_DIR/shard3" \
  --logpath "$BASE_DIR/logs/shard3.log" \
  --logappend > /dev/null 2>&1 &

nohup mongod --shardsvr --replSet shard4ReplSet --port 27022 \
  --dbpath "$BASE_DIR/shard4" \
  --logpath "$BASE_DIR/logs/shard4.log" \
  --logappend > /dev/null 2>&1 &

sleep 5

echo "Démarrage du routeur Mongos..."
nohup mongos --configdb configReplSet/localhost:27019 --port 27017 \
  --logpath "$BASE_DIR/logs/mongos.log" \
  --logappend > /dev/null 2>&1 &

echo "Serveurs MongoDB démarrés."
