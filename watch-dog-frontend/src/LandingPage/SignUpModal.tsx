import React from 'react';

const SignUpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="modal">
    <h2>Sign Up</h2>
    <form>
      <label>
        Username:
        <input type="text" name="username" />
      </label>
      <label>
        Password:
        <input type="password" name="password" />
      </label>
      <button type="submit">Sign Up</button>
    </form>
    <button onClick={onClose}>Close</button>
  </div>
);

export default SignUpModal;
