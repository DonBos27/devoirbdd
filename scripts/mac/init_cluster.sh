#!/bin/bash

echo "Initialisation du Config Server..."
mongosh --port 27019 --eval '
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [{ _id: 0, host: "localhost:27019" }]
})'

sleep 3

echo "Initialisation des Shards..."
mongosh --port 27018 --eval 'rs.initiate({_id:"shard1ReplSet", members:[{_id:0, host:"localhost:27018"}]})'
mongosh --port 27020 --eval 'rs.initiate({_id:"shard2ReplSet", members:[{_id:0, host:"localhost:27020"}]})'
mongosh --port 27021 --eval 'rs.initiate({_id:"shard3ReplSet", members:[{_id:0, host:"localhost:27021"}]})'
mongosh --port 27022 --eval 'rs.initiate({_id:"shard4ReplSet", members:[{_id:0, host:"localhost:27022"}]})'

echo "Démarrage du routeur Mongos..."

nohup mongos \
  --configdb configReplSet/localhost:27019 \
  --port 27017 \
  --logpath "$(pwd)/mongo-cluster/logs/mongos.log" \
  --logappend > /dev/null 2>&1 &

sleep 5

echo "Ajout des shards dans Mongos..."
mongosh --port 27017 --eval '
sh.addShard("shard1ReplSet/localhost:27018");
sh.addShard("shard2ReplSet/localhost:27020");
sh.addShard("shard3ReplSet/localhost:27021");
sh.addShard("shard4ReplSet/localhost:27022");
sh.status();
'

echo "Cluster MongoDB initialisé."
