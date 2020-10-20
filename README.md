# Identity provider

This repository containst the `docker-compose` scripts for setting up a Keycloak instance with `md5crypt` authentication.

## How to run

Set up the variables in `local.env`, or create your env file.

```docker-compose up```

Login on `localhost:8080` and create a `cngei` realm.  
Go to `Authentication` / `Password Policy` and add a `Hashing Algorithm` policy with value `md5crypt`.  

Put a `dump.json` file in the `import` directory with the content of the `fe_users` table, then run (you need NodeJS, and check the variables in `index.js`)
```
cd import
npm install
npm run start
```

## Authors

[Paolo Campanelli](paolo.campanelli@cngei.it) - Initial work