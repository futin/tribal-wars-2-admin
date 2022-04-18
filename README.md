#  Tribal Wars 2 - Admin tool
> a tool that helps you by providing solutions for multiple manual tasks

## Install

Please run the "install" command first:

```sh
$ npm install
```

This will install all the required dependencies, as stated in `package.json`file.

To start the server, run one of next two commands:

```sh
# Starts server with nodemon
$ npm run start

# Starts the server normally
$ npm run dev
```


## Setup

In this section you can find the setup instructions

### Server setup

In order to run the server locally, you can provide custom environment variables for it:

```sh
PORT='3018'
SERVER_URL='http://localhost:3018'
```

`PORT` is required for setting up the server itself. 

`SERVER_URL` is not mandatory, since it will default to `http://localhost:${PORT}`.

### Authentication with tribal wars 

Authentication is quite tricky, since there is no way (at least I didn't find one) to provide username and password, and receive the token back.

Below are some mandatory environment variables and steps how to configure them. Without this you will not be able to run the server.

```sh
TW_AUTH_NAME='your-username'
TW_WORLD_NAME='world-name'
TW_AUTH_TOKEN='your-token'
```

`TW_AUTH_NAME` and `TW_WORLD_NAME` are quite easy to acquire, since you already have this information.

`TW_AUTH_NAME` => Player name / username
`TW_WORLD_NAME` => Current world you are playing on

`TW_AUTH_TOKEN` is a bit harder to acquire, so follow these steps:

1. Login to your world and open developer tools
2. Once developer tools window is opened, refresh the page
3. Select `Network` tab from the tools headers
4. Search for a socket request, either manually or by filtering http requests by `socket`
5. Now select `Messages` tab from the socket request. Here you can follow all socket requests between the browser and the server
6. One of the first messages has a type `Authentication/login`, where the token is being kept under `1.data.token`
7. Copy/past the token from the step above into your .env under the name `TW_AUTH_TOKEN`
8. You are all set!

Now you should be able to run the server. Here you can find simple http requests that will let you know if your `TW configs` are set up correctly.

### MongoDB setup

This project is using mongoDB as a persistent layer. Next key is required:

```sh
MONGO_URL=mongodb://localhost:27017/your-collection-name
```

Note that server can still run without the database, but multiple features will not work without the database.

### Google docs

In order to get a better preview of your villages and their data, it is possible to persist the data into google documents.

In order to configure it, you are required to provide next environment variables:

```sh
GOOGLE_DOC_PRIVATE_KEY=XXX
GOOGLE_DOC_CLIENT_EMAIL=some-email
```

In order to set up the google documents, you need to create your own account and follow the setup for acquiring the private key and your email [here](https://developers.google.com/docs)

Below in the http requests section you will be allowed to provide the `googleDocId` in order to save all of your data to your google document.

### Optional security for production

If running in production is required (on some public server), you are allowed to provide optional security:

```sh
API_SECRET_TOKEN=11235813
```

This token is inspected only in production environment, and every request that is sent to the server must provide the `API_SECRET_TOKEN` that you have configured via `Request Headers`.


## How to use

This is the good side of GraphQL, all the requests are already coming documented out-of-the-box. Simply run your server, a open the link in browser where the inspection tool will pop up.

If you prefer to use some external API tool (as Postman or Paw) you can easily export the whole schema as JSON or SDL file and import it into your API tool.

### Persisted vs non-persisted APIs

Next naming convention will help you with determining which method you require:

`activate*` : Everything that starts with `activate` means that there is no database included, and every request is executed immediately

All other methods require database usage by performing different CRUD operations.

### Supported features

- Farming barbarian villages and/or small abandoned villages
- Units recruitment (from Barracks and HOO)
- Building upgrades
- Scheduling attacks and performing precise attack calculations
- Spies recruitment
- Units movement
- Mass donation

**Coming soon**: explanation of every feature in more detail

