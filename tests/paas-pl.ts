import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PaasPl } from "../target/types/paas_pl";
import * as assert from "assert";

describe("paas-pl", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PaasPl as Program<PaasPl>;

  const TEST_KP = [
    51, 252, 247, 253, 140, 200, 174, 220, 225, 102, 196, 37, 230, 1, 65, 235,
    91, 139, 15, 9, 95, 253, 125, 74, 148, 2, 127, 158, 109, 33, 156, 106, 173,
    239, 85, 135, 32, 144, 12, 150, 44, 151, 119, 165, 164, 253, 252, 154, 230,
    133, 162, 224, 172, 42, 63, 67, 172, 71, 216, 147, 194, 31, 115, 91,
  ];

  const poolTestKP = require("./pool-test.json");
  const adminTestKP = require("./admin-test.json");

  const prefundedKeypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(TEST_KP),
  );

  const poolKeypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(poolTestKP),
  );

  const adminKeypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(adminTestKP),
  );

  // let adminKeypair = anchor.web3.Keypair.generate();
  let userKeypair = anchor.web3.Keypair.generate();
  // let poolKeypair = anchor.web3.Keypair.generate();

  async function transferSol(
    fromKeypair: anchor.web3.Keypair,
    toPubkey: anchor.web3.PublicKey,
    amount: number,
  ) {
    const tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey,
        lamports: amount,
      }),
    );
    return await provider.sendAndConfirm(tx, [fromKeypair]);
  }

  it("Initializes the pool", async () => {
    // Fund admin wallet from the prefunded wallet
    let sig = await transferSol(
      prefundedKeypair,
      adminKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );

    console.log("Admin wallet funded. Transaction signature:", sig);

    const adminBalance = await provider.connection.getBalance(
      adminKeypair.publicKey,
    );
    console.log("Admin wallet funded with:", adminBalance, "SOL");

    // Transaction to initialize the pool
    const tx = await program.methods
      .initializePool()
      .accounts({
        pool: poolKeypair.publicKey,
        admin: adminKeypair.publicKey,
      })
      .signers([adminKeypair, poolKeypair])
      .rpc();

    console.log("Pool initialized. Transaction signature:", tx);

    // Verify pool account
    const poolAccount = await program.account.pool.fetch(poolKeypair.publicKey);

    console.log("Pool balance:", poolAccount.balance.toNumber());
    console.log("Pool admin:", poolAccount.admin.toString());

    assert.strictEqual(poolAccount.balance.toNumber(), 0);
    assert.strictEqual(
      poolAccount.admin.toString(),
      adminKeypair.publicKey.toBase58(),
    );
  });

  it("Deposits SOL into the pool", async () => {
    // Fund user wallet from the prefunded wallet
    await transferSol(
      prefundedKeypair,
      userKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );

    const userBalanceBefore = await provider.connection.getBalance(
      userKeypair.publicKey,
    );
    console.log("User wallet funded with:", userBalanceBefore / 1e9, "SOL");

    // Deposit random SOL amount
    const depositAmount = 1; // Change this amount for different tests
    let beforePoolBalance = await provider.connection.getBalance(
      poolKeypair.publicKey,
    );

    console.log("Pool balance before deposit:", beforePoolBalance / 1e9, "SOL");

    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        pool: poolKeypair.publicKey,
        user: userKeypair.publicKey,
      })
      .signers([userKeypair])
      .rpc();

    console.log("Deposit transaction signature:", tx);

    // Verify user balance after deposit
    const userBalanceAfter = await provider.connection.getBalance(
      userKeypair.publicKey,
    );
    console.log("User balance after deposit:", userBalanceAfter / 1e9, "SOL");

    assert.ok(userBalanceBefore >= userBalanceAfter);

    // Verify pool balance
    const poolBalance = await provider.connection.getBalance(
      poolKeypair.publicKey,
    );
    console.log("Pool balance after deposit:", poolBalance / 1e9, "SOL");

    const poolAccount = await program.account.pool.fetch(poolKeypair.publicKey);
    assert.ok(poolAccount.balance.toNumber() >= depositAmount * 1e9);
  });
});
