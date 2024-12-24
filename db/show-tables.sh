#!/bin/bash

echo "Listing all tables in database ${MARIADB_DATABASE}:"
mysql -u "${MARIADB_USER}" -p"${MARIADB_PASSWORD}" -e "SHOW TABLES;" "${MARIADB_DATABASE}" 