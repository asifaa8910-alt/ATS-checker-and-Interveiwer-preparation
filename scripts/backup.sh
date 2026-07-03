#!/bin/bash
set -e

BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
echo "Creating MongoDB backup snapshot in $BACKUP_DIR..."
mongodump --uri="mongodb://localhost:27017/interviewai" --out="$BACKUP_DIR/$(date +%F_%T)" || echo "MongoDB dump skipped: mongodump utility not found or database unreachable."
