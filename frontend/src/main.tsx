import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for Promise.allSettled (Safari < 13 compatibility)
if (!Promise.allSettled) {
  Promise.allSettled = function <T>(promises: Iterable<T | PromiseLike<T>>): Promise<PromiseSettledResult<T>[]> {
    return Promise.all(
      Array.from(promises).map(p =>
        Promise.resolve(p).then(
          value => ({ status: 'fulfilled', value }),
          reason => ({ status: 'rejected', reason })
        )
      )
    );
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
