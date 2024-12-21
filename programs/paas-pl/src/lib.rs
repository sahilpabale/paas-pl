use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::{deposit::*, pool::*};

pub mod state;

declare_id!("FXrWyNVcCAbeu1voQbAK5qx7ig9KerHb3ztayBsi2ViQ");

#[program]
pub mod paas_pl {

    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        InitializePool::initialize_pool(ctx)
    }

    pub fn deposit(ctx: Context<DepositConfig>, amount: u64) -> Result<()> {
        DepositConfig::deposit(ctx, amount)
    }
}
