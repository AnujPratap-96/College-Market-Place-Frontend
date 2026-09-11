import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { fetchWallet } from '@/modules/wallet/wallet.api'
import type { IWallet } from '@/modules/wallet/wallet.types'

export interface WalletState {
  balance: number
  escrowBalance: number
  loading: boolean
}

const initialState: WalletState = {
  balance: 0,
  escrowBalance: 0,
  loading: false,
}

export const loadWallet = createAsyncThunk(
  'wallet/loadWallet',
  async (_, { rejectWithValue }) => {
    const res = await fetchWallet()
    if (res.error || !res.wallet) {
      return rejectWithValue(res.error || 'Failed to fetch wallet')
    }
    return res.wallet
  }
)

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletBalances: (
      state,
      action: PayloadAction<{ balance: number; escrowBalance: number }>
    ) => {
      state.balance = action.payload.balance
      state.escrowBalance = action.payload.escrowBalance
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWallet.pending, (state) => {
        state.loading = true
      })
      .addCase(loadWallet.fulfilled, (state, action: PayloadAction<IWallet>) => {
        state.loading = false
        state.balance = action.payload.balance
        state.escrowBalance = action.payload.escrowBalance
      })
      .addCase(loadWallet.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { setWalletBalances } = walletSlice.actions
export default walletSlice.reducer
