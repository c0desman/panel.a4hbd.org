'use client'
import React, { useState } from 'react'
import { allIcons } from '@/lib/lucide-icons'
import Image from 'next/image'

// Util to get list of icon names from lucide-react
const iconList = Object.keys(allIcons)

const IconSelector = ({ onSelect }) => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filteredIcons = iconList.filter(icon => icon.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search icon"
        className="border p-2 w-full"
        onClick={() => setOpen(true)}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && (
        <div className="absolute z-10 bg-white shadow-md max-h-48 overflow-y-auto w-full">
          {filteredIcons.map((iconName) => {
            const LucideIcon = allIcons[iconName]
            return (
              <div
                key={iconName}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  onSelect(iconName)
                  console.log('Selected Icon:', iconName)
                  setOpen(false)
                }}
              >
                <LucideIcon size={18} />
                <span>{iconName}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const ColorPicker = () => {
  return (
    <input
      type="color"
      onChange={(e) => console.log('Selected Color:', e.target.value)}
      className="w-12 h-10 p-1"
    />
  )
}

const FileUpload = ({ label }) => {
  const [preview, setPreview] = useState(null)
  return (
    <div>
      <label className="block font-medium">{label}</label>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) setPreview(URL.createObjectURL(file))
        }}
        className="mb-2"
      />
      {preview && (
        <Image src={preview} alt="Preview" className="w-48 h-auto mt-2" width={192} height={120} />
      )}
    </div>
  )
}

// Card with dynamic icon and color
const CardForm = ({ onRemove }) => (
  <div className="border p-4 space-y-3">
    <input placeholder="Title" className="border p-2 w-full" />
    <input placeholder="Small Description" className="border p-2 w-full" />
    <IconSelector onSelect={() => {}} />
    <ColorPicker />
    {onRemove && <button onClick={onRemove} className="bg-red-500 text-white p-2">- Remove Card</button>}
  </div>
)

export default function PageEditor() {
  const [cards, setCards] = useState(Array(4).fill({}))
  const [aboutCards, setAboutCards] = useState(Array(2).fill({}))
  const [impactCards, setImpactCards] = useState(Array(4).fill({}))
  const [projectCards, setProjectCards] = useState(Array(5).fill({}))

  return (
    <div className="space-y-10 p-6 max-w-5xl mx-auto">

      {/* Hero Section */}
      <section>
        <h2 className="text-2xl font-bold">Hero Section</h2>
        <textarea placeholder="Title (HTML allowed)" className="border p-2 w-full" />
        <textarea placeholder="Short Description" className="border p-2 w-full" />
        <input placeholder="Button Text" className="border p-2 w-full" />
        <input placeholder="Button URL" className="border p-2 w-full" />
        <FileUpload label="Image/Video 1" />
        <FileUpload label="Image/Video 2" />
        <FileUpload label="Background Image/Video" />
      </section>

      {/* Card Section */}
      <section>
        <h2 className="text-2xl font-bold">Card Section</h2>
        {cards.map((_, i) => (
          <CardForm
            key={i}
            onRemove={i >= 4 ? () => setCards(cards.filter((_, idx) => idx !== i)) : null}
          />
        ))}
        <button
          onClick={() => setCards([...cards, {}])}
          className="bg-green-500 text-white px-4 py-2 mt-2"
        >
          + Add Card
        </button>
      </section>

      {/* About Us Section */}
      <section>
        <h2 className="text-2xl font-bold">About Us Section</h2>
        <textarea placeholder="Title with CSS" className="border p-2 w-full" />
        <textarea placeholder="Short Description" className="border p-2 w-full" />
        {aboutCards.map((_, i) => (
          <CardForm key={i} />
        ))}
        <input placeholder="Button Text" className="border p-2 w-full" />
        <input placeholder="Button URL" className="border p-2 w-full" />
        <FileUpload label="Main Image/Video" />
      </section>

      {/* Our Impact Section */}
      <section>
        <h2 className="text-2xl font-bold">Our Impact Section</h2>
        <textarea placeholder="Title (HTML allowed)" className="border p-2 w-full" />
        <textarea placeholder="Short Description" className="border p-2 w-full" />
        {impactCards.map((_, i) => (
          <div key={i} className="border p-4 space-y-2">
            <input type="number" placeholder="Number" className="border p-2 w-full" />
            <input placeholder="Postfix Text" className="border p-2 w-full" />
            <input placeholder="Title" className="border p-2 w-full" />
            <IconSelector onSelect={() => {}} />
            <ColorPicker />
          </div>
        ))}
      </section>

      {/* Our Projects Section */}
      <section>
        <h2 className="text-2xl font-bold">Our Projects Section</h2>
        <textarea placeholder="Title (HTML allowed)" className="border p-2 w-full" />
        <textarea placeholder="Short Description" className="border p-2 w-full" />
        <input placeholder="Button Text" className="border p-2 w-full" />
        <input placeholder="Button URL" className="border p-2 w-full" />
        {projectCards.map((_, i) => (
          <div key={i} className="border p-4">
            <input placeholder="Project Title" className="border p-2 w-full" />
            <FileUpload label="Image/Video" />
          </div>
        ))}
      </section>
    </div>
  )
}
