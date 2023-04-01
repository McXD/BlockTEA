const grpc = require("@grpc/grpc-js");
const { Identity, Signer, signers } = require("@hyperledger/fabric-gateway");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

const mspId = "Org2MSP";

// Path to crypto materials.
const cryptoPath = path.resolve(
  __dirname,
  "..",
  "test-network",
  "organizations",
  "peerOrganizations",
  "org2.example.com"
);

// Path to user private key directory.
const keyDirectoryPath = path.resolve(
  cryptoPath,
  "users",
  "User1@org2.example.com",
  "msp",
  "keystore"
);

// Path to user certificate.
const certPath = path.resolve(
  cryptoPath,
  "users",
  "User1@org2.example.com",
  "msp",
  "signcerts",
  "User1@org2.example.com-cert.pem"
);

// Path to peer tls certificate.
const tlsCertPath = path.resolve(
  cryptoPath,
  "peers",
  "peer0.org2.example.com",
  "tls",
  "ca.crt"
);

// Gateway peer endpoint.
const peerEndpoint = "localhost:9051";

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": "peer0.org2.example.com",
  });
}

async function newIdentity() {
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function newSigner() {
  const files = await fs.readdir(keyDirectoryPath);
  const keyPath = path.resolve(keyDirectoryPath, files[0]);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

module.exports = {
  newGrpcConnection,
  newIdentity,
  newSigner,
};
