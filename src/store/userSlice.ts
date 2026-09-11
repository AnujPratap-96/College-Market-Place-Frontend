import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // ✅ type-only import

interface UserState {
  id: string
  name: string
  phone?: string
  email: string
  college: string
  branch: string
  year: string
  role?: string
  photoUrl?: string
  isLoggedIn: boolean
}

const initialState: UserState = {
  id: '',
  name: '',
  phone: '',
  email: '',
  college: '',
  branch: '',
  year: '',
  role: 'USER',
  photoUrl: '',
  isLoggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: string
        name: string
        phone?: string
        email: string
        college: string
        branch: string
        year: string
        role?: string
        photoUrl?: string
      }>
    ) => {
      const {
        id, name, phone, email, college, branch, year, role, photoUrl,
      } = action.payload

      state.id = id
      state.name = name
      state.phone = phone
      state.email = email
      state.college = college
      state.branch = branch
      state.year = year
      state.role = role || 'USER'
      state.photoUrl = photoUrl
      state.isLoggedIn = true
    },
    clearUser: (state) => {
      state.id = ''
      state.name = ''
      state.phone = ''
      state.email = ''
      state.college = ''
      state.branch = ''
      state.year = ''
      state.photoUrl = ''
      state.isLoggedIn = false
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
