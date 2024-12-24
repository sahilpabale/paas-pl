use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::{deposit::*, pool::*};

pub mod state;

declare_id!("3M6uqv16rUXczDzBApDdnFP6CLvgLbi3TidSWXYxFgX8");

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
