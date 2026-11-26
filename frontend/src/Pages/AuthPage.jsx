import { useState } from 'react'
import { ArrowRight, BookOpenText, Check, Eye, EyeOff, FileText, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { setDemoSession, setSession } from '@/store/slices/authSlice'
import { useLoginMutation, useSignupMutation } from '@/hooks/auth/useAuthMutation'

export function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const authenticated = useSelector((state) => Boolean(state.auth.token || state.auth.isDemo))
  const login = useLoginMutation()
  const signup = useSignupMutation()
  const pending = login.isPending || signup.isPending

  if (authenticated) return <Navigate to="/" replace />

  async function submit(event) {
    event.preventDefault()
    setFormError('')
    try {
      const session = isSignup
        ? await signup.mutateAsync({ name: name.trim(), email: email.trim(), password })
        : await login.mutateAsync({ email: email.trim(), password })
      queryClient.clear()
      dispatch(setSession(session))
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error.apiError?.message || 'Could not sign you in. Please try again.')
    }
  }

  function continueDemo() {
    queryClient.clear()
    dispatch(setDemoSession('ayush'))
    navigate('/', { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Draftly workspace overview">
        <Link to="/login" className="auth-brand"><span className="brand-mark"><BookOpenText size={20} /></span><span>draftly<span>.</span></span></Link>
        <div className="auth-story-copy">
          <span className="auth-kicker"><Sparkles size={14} /> A calmer place to think</span>
          <h1>Make room for<br /><em>good ideas.</em></h1>
          <p>Bring your notes, plans, and half-formed thoughts into one beautifully simple workspace.</p>
          <div className="auth-story-card">
            <div className="auth-card-icon"><FileText size={18} /></div>
            <div><strong>Everything in its place</strong><span>Your ideas, ready whenever you are.</span></div>
            <Check size={17} className="auth-card-check" />
          </div>
        </div>
        <div className="auth-story-footer"><span>Draftly</span><span>YOUR IDEAS, IN ORDER</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="brand-mark"><BookOpenText size={18} /></span><strong>draftly<span>.</span></strong></div>
          <span className="auth-step">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</span>
          <h2>{isSignup ? 'Create your account' : 'Sign in to Draftly'}</h2>
          <p className="auth-subtitle">{isSignup ? 'A little space for your next big idea.' : 'Pick up right where your ideas left off.'}</p>

          <form className="auth-form" onSubmit={submit}>
            {isSignup && <label className="auth-field"><span>Your name</span><div className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" maxLength={80} required /></div></label>}
            <label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" maxLength={254} required /></div></label>
            <label className="auth-field"><span>Password</span><div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'} minLength={isSignup ? 6 : 1} maxLength={128} required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
            {formError && <p className="auth-error" role="alert">{formError}</p>}
            <button className="auth-submit" type="submit" disabled={pending}>{pending ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button>
          </form>

          <div className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Draftly?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create an account'}</Link></div>
          <div className="auth-divider"><span>or</span></div>
          <button className="auth-demo-button" type="button" onClick={continueDemo}><span className="auth-demo-avatar">AY</span><span>Explore the demo workspace<small>Try Draftly without creating an account</small></span><ArrowRight size={16} /></button>
          <p className="auth-legal">By continuing, you agree to keep your workspace kind and organized.</p>
        </div>
      </section>
    </main>
  )
}
