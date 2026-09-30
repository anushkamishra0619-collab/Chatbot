import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_KEY, URL } from '../../constants'

const MAX_ATTEMPTS = 3

const loadHistory = () => {
  try {
    const savedHistory = localStorage.getItem('history')
    if (!savedHistory) return []

    const parsedHistory = JSON.parse(savedHistory)
    if (Array.isArray(parsedHistory)) return parsedHistory
    return typeof parsedHistory === 'string' ? [parsedHistory] : []
  } catch {
    return []
  }
}

export const askQuestion = createAsyncThunk(
  'chat/askQuestion',
  async (question, { rejectWithValue }) => {
    if (!API_KEY) {
      return rejectWithValue(
        'Missing API key. In Vercel, add VITE_GEMINI_API_KEY under Project Settings > Environment Variables, then redeploy. Locally, add it to .env.local and restart the dev server.'
      )
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      try {
        const { data } = await axios.post(URL, {
          contents: [{ parts: [{ text: question }] }],
        })

        const candidate = data?.candidates?.[0]
        const text = candidate?.content?.parts
          ?.map((part) => part.text)
          .filter(Boolean)
          .join('\n')

        if (text) return text

        const reason = data?.promptFeedback?.blockReason || candidate?.finishReason
        return rejectWithValue(
          reason
            ? `The API couldn't answer this question (${reason}). Try rephrasing it.`
            : 'The API returned no answer. Please try again.'
        )
      } catch (error) {
        const status = error.response?.status
        if (status === 503 && attempt < MAX_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
          continue
        }

        const errorMessage =
          error.response?.data?.error?.message || 'The API returned an unexpected error.'

        if (status) return rejectWithValue(`Error ${status}: ${errorMessage}`)
        return rejectWithValue('Network error — check your connection.')
      }
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    answer: '',
    loading: false,
    recentHistory: loadHistory(),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(askQuestion.pending, (state, action) => {
        state.loading = true
        state.answer = ''
        state.recentHistory = [action.meta.arg, ...state.recentHistory]
      })
      .addCase(askQuestion.fulfilled, (state, action) => {
        state.loading = false
        state.answer = action.payload
      })
      .addCase(askQuestion.rejected, (state, action) => {
        state.loading = false
        state.answer = action.payload || 'The request failed. Please try again.'
      })
  },
})

export default chatSlice.reducer