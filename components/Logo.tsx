import React from 'react';
import Link from 'next/link';
import s from '../styles/Logo.module.css';
export default function Logo() {
  return (
    <Link href="/" className={s.wrap}>
      <span className={s.mark}>ℵ</span>
      <span className={s.text}>Gematria</span>
    </Link>
  );
}
