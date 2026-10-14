import { useRef, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Avatar } from './Avatar'
import { fileToAvatarDataUrl } from '../utils/avatar'
import styles from './AddPersonSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (name: string, avatar: string | null) => void
}

export function AddPersonSheet({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName('')
    setAvatar(null)
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setAvatar(dataUrl)
    } catch (err) {
      console.error(err)
    } finally {
      e.target.value = '' // позволяем выбрать тот же файл повторно
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name, avatar)
    reset()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <form onSubmit={submit} className={styles.form}>
        <h2 className={styles.title}>Новый человек</h2>

        <button
          type="button"
          className={styles.avatarBtn}
          onClick={() => fileRef.current?.click()}
        >
          <Avatar name={name || '?'} avatar={avatar} size={92} />
          <span className={styles.avatarHint}>
            {avatar ? 'Изменить фото' : 'Добавить фото'}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickFile}
        />

        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          autoFocus
          enterKeyHint="done"
        />

        <Button type="submit" full disabled={!name.trim()}>
          Добавить
        </Button>
      </form>
    </BottomSheet>
  )
}
