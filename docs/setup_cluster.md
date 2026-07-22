# Configuration du Cluster MongoDB

## Objectif

Cette étape avait pour objectif de mettre en place une infrastructure MongoDB distribuée servant de base au projet **G_4_Pay**.

## Travaux réalisés

Les principales tâches effectuées sont les suivantes :

- Création de l'arborescence du projet.
- Développement des scripts de démarrage et d'initialisation du cluster.
- Configuration du Config Server (Replica Set).
- Configuration des quatre Shards (Replica Sets).
- Configuration du routeur Mongos.
- Initialisation de tous les Replica Sets.
- Ajout des quatre shards au cluster.
- Activation du sharding sur la base de données **momo**.
- Création des collections de la plateforme.
- Génération de jeux de données réalistes pour :
  - les utilisateurs ;
  - les agents ;
  - les commerçants ;
  - les transactions.

---

## Architecture du cluster

```
                    Client
                       │
                    Mongos
                       │
              Config Server
                       │
    ┌──────────┬──────────┬──────────┬──────────┐
    │          │          │          │
 Shard 1   Shard 2   Shard 3   Shard 4
```

---

## Base de données

Base de données :

```
momo
```

Collections :

- users
- agents
- merchants
- transactions

Clé de sharding :

```javascript
{
  senderPhone: "hashed";
}
```

---

## Résultat obtenu

Le cluster MongoDB distribué est entièrement opérationnel.

L'ensemble des collections a été créé et alimenté avec un jeu de données réaliste représentant une plateforme de Mobile Money au Sénégal.

L'infrastructure est désormais prête pour les prochaines étapes du projet, notamment :

- la mise en place de la sécurité ;
- les tests de cohérence des données ;
- l'analyse des performances du sharding ;
- l'évaluation des requêtes distribuées.
