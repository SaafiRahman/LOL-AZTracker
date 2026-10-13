import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase.js'

// Bug reports and feedback go to the Firestore `feedback` collection. Security
// rules allow anyone to create a well-formed document and nobody to read one;
// the developer reads them in the Firebase console. No account id is stored.

export const FEEDBACK_KINDS = [
  { key: 'bug', label: 'Bug' },
  { key: 'idea', label: 'Idea' },
  { key: 'other', label: 'Something else' },
]

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 2000

// The technical context attached to a message. Shown to the player before they
// send, so keep this list and the copy in Contact.jsx in step.
export function feedbackContext({ signedIn }) {
  return {
    userAgent: navigator.userAgent.slice(0, 400),
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    page: window.location.pathname,
    signedIn: Boolean(signedIn),
  }
}

export async function sendFeedback({ kind, message, email, signedIn }) {
  if (!firebaseEnabled) throw new Error('Feedback isn’t available on this copy of the app.')
  await addDoc(collection(db, 'feedback'), {
    kind,
    message,
    email: email || null,
    context: feedbackContext({ signedIn }),
    createdAt: serverTimestamp(),
  })
}
