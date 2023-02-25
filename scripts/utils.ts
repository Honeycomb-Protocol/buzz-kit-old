import fs from 'fs';
import key from '../key.json';
import { Config } from './types';
import { Connection, Keypair } from '@solana/web3.js';
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';


// CONFIGS
export const devnetConfig: Config = {
  network: "devnet",
  // endpoint: "https://api.devnet.solana.com/",
  // endpoint: "https://metaplex.devnet.rpcstaking_pool.com/",
  endpoint:
    "https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/",
};

export const mainnetConfig: Config = {
  network: "mainnet-beta",
  endpoint: "https://api.metaplex.solana.com",
};


// GET DEPLOYMENTS
export const getDeployments = (
  program: string,
  network: "mainnet" | "devnet"
) => {
  let deployments = {};
  try {
    deployments = JSON.parse(fs.readFileSync("./deployments.json").toString());
  } catch (e) { }

  if (!Object.keys(deployments).includes(program))
    throw new Error(`Deployment for ${program} not found!`);

  if (!Object.keys(deployments[program]).includes(network))
    throw new Error(`Deployment for ${network} not found!`);

  return deployments[program][network];
};

// SET DEPLOYMENTS
export const setDeployments = (
  program: string,
  network: "mainnet" | "devnet",
  deployments: any
) => {
  let deploymentsMap = {};

  try {
    deploymentsMap = JSON.parse(
      fs.readFileSync("./deployments.json").toString()
    );
  } catch (e) { }

  if (!Object.keys(deploymentsMap).includes(program))
    deploymentsMap[program] = {};

  if (!Object.keys(deploymentsMap[program]).includes(program))
    deploymentsMap[program][network] = {};

  deploymentsMap[program][network] = deployments;

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentsMap, null, 2)
  );
};

// GET DEPENDENCIES
export const getDependencies = (
  network: "mainnet" | "devnet",
  programName: string
) => {
  const config = network === "mainnet" ? mainnetConfig : devnetConfig;
  const keypair = Keypair.fromSecretKey(Uint8Array.from(key));

  const connection = new Connection(config.endpoint);
  const mx = new Metaplex(connection);
  mx.use(keypairIdentity(keypair));

  const setDeploymentsLocal = (deployments) =>
    setDeployments(programName, network, deployments);

  let deployments: any = {
    program: "PROGRAM_ADDRESS",
  };

  try {
    deployments = getDeployments(programName, network);
  } catch {
    setDeploymentsLocal(deployments);
  }

  return {
    config,
    connection,
    deployments,
    mx,
    setDeployments: setDeploymentsLocal,
  };
};