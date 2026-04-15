import { redirect } from 'next/navigation';

/**
 * Legacy register page — redirects to canonical /register route.
 * The canonical implementation lives in app/(auth)/register.
 */
export default function LegacyRegisterPage() {
  redirect('/register');
}
/*
            <legend className="label mb-1">I am a…</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['guest', 'owner'] as const).map((r) => (
                <label
                  key={r}
                  className={
                    'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ' +
                    (role === r
                      ? 'border-forest-600 bg-forest-50 text-forest-800'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600')
                  }
                >
                  <input
                    type="radio" name="role" value={r}
                    checked={role === r} onChange={() => setRole(r)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{r === 'guest' ? '🧳' : '🏠'}</span>
                  <span className="font-medium capitalize">{r}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="displayName" className="label">Full name</label>
            <input id="displayName" type="text" autoComplete="name" required
              className="input-field" placeholder="Ion Popescu"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            {errors.displayName && <p className="error-msg" role="alert">{errors.displayName}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="label">Email address</label>
            <input id="reg-email" type="email" autoComplete="email" required
              className="input-field" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="error-msg" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <input id="reg-password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="Min. 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="error-msg" role="alert">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirmPassword && <p className="error-msg" role="alert">{errors.confirmPassword}</p>}
          </div>

          {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-forest-700 hover:text-forest-900 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
*/
