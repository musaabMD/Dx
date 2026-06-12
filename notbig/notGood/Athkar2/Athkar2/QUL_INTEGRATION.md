# QUL Integration for Athkar2

This app uses an offline-first SQLite Quran store and a manifest-driven pack installer.

## What is implemented

- Local database tables for chapters, verses, translations, tafsir, audio ayah metadata, mushaf layout words, and installed packs.
- Built-in core seed (all 114 chapter metadata + sample Surah Al-Fatihah content).
- Manifest loader to discover downloadable packs.
- Pack installer for JSON bundles.

## Manifest format

Host a JSON file (for example on Cloudflare R2, S3, or your own CDN):

```json
{
  "generated_at": "2026-02-22T02:40:00Z",
  "packs": [
    {
      "id": "qul-core-ar-en",
      "title": "QUL Core Arabic + English",
      "description": "Uthmani script + Sahih International",
      "version": "1.0.0",
      "base_url": "https://cdn.example.com/quran-packs/qul-core-ar-en/",
      "chapters_file": "chapters.json",
      "verses_file": "verses.json",
      "translation_files": [
        {
          "resource_id": "en.sahih",
          "language": "en",
          "title": "Sahih International",
          "file": "translation_en_sahih.json"
        }
      ],
      "tafsir_files": [
        {
          "resource_id": "en.tafsir.sample",
          "language": "en",
          "title": "Sample Tafsir",
          "file": "tafsir_en_sample.json"
        }
      ],
      "audio_files": [
        {
          "reciter_id": "ar.alafasy.sample",
          "title": "Alafasy Sample",
          "file": "audio_manifest.json",
          "base_audio_url": "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/"
        }
      ],
      "layout_file": {
        "layout_id": "madani-15line-sample",
        "title": "Madani 15-line Sample",
        "file": "layout_words.json"
      },
      "mushaf_layout_file": {
        "layout_id": "kfgqpc-v2",
        "title": "KFGQPC V2 Layout",
        "file": "mushaf_pages.json"
      },
      "mushaf_script_file": {
        "layout_id": "kfgqpc-v2",
        "title": "KFGQPC V2 Script",
        "file": "mushaf_words.json"
      },
      "mushaf_layout_sqlite_file": {
        "layout_id": "kfgqpc-v2",
        "title": "KFGQPC V2 Layout SQLite",
        "file": "mushaf_layout.db"
      },
      "mushaf_script_sqlite_file": {
        "layout_id": "kfgqpc-v2",
        "title": "KFGQPC V2 Script SQLite",
        "file": "quran-script-qpc-v2.db"
      }
    }
  ]
}
```

## JSON files expected by app

### `chapters.json`

```json
[
  {
    "number": 1,
    "name_ar": "الفاتحة",
    "name_en": "Al-Fatihah",
    "revelation": "meccan",
    "verse_count": 7
  }
]
```

### `verses.json`

```json
[
  { "chapter": 1, "verse": 1, "text_uthmani": "..." }
]
```

or

```json
[
  { "verse_key": "1:1", "text_uthmani": "..." }
]
```

### translation file

```json
[
  { "verse_key": "1:1", "text": "..." }
]
```

### tafsir file

```json
[
  { "verse_key": "1:1", "text": "..." }
]
```

### audio manifest file

```json
[
  { "verse_key": "1:1", "path": "001001.mp3", "duration_ms": 4310 }
]
```

or

```json
[
  { "verse_key": "1:1", "url": "https://.../001001.mp3", "duration_ms": 4310 }
]
```

### layout words file

```json
[
  {
    "page": 1,
    "line_number": 1,
    "position": 1,
    "verse_key": "1:1",
    "word_index": 1,
    "x": 0.72,
    "y": 0.10,
    "width": 0.11,
    "height": 0.04,
    "token": "بِسْمِ"
  }
]
```

### mushaf pages file (QUL layout)

```json
[
  {
    "page_number": 1,
    "line_number": 1,
    "line_type": "surah_name",
    "is_centered": 1,
    "surah_number": 1
  },
  {
    "page_number": 1,
    "line_number": 2,
    "line_type": "ayah",
    "is_centered": 0,
    "first_word_id": 1,
    "last_word_id": 7
  }
]
```

### mushaf words file (QUL script)

```json
[
  { "word_index": 1, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "بِسْمِ" },
  { "word_index": 2, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "اللَّهِ" }
]
```

### mushaf layout SQLite file

The installer now supports importing directly from a QUL layout SQLite file.

Required table and columns:

- table: `pages`
- columns: `page_number`, `line_number`, `line_type`, `is_centered`, `first_word_id`, `last_word_id`, `surah_number`

### mushaf script SQLite file

The installer now supports importing directly from a QUL script SQLite file.

Required table and columns:

- table: `words`
- columns: `word_index`, `word_key`, `surah`, `ayah`, `text`

## Starter sample pack in repo

- `Athkar2/QuranPackSamples/manifest.json`
- `Athkar2/QuranPackSamples/qul-core-sample/chapters.json`
- `Athkar2/QuranPackSamples/qul-core-sample/verses.json`
- `Athkar2/QuranPackSamples/qul-core-sample/translation_en_sahih.json`
- `Athkar2/QuranPackSamples/qul-core-sample/tafsir_en_sample.json`
- `Athkar2/QuranPackSamples/qul-core-sample/audio_manifest.json`
- `Athkar2/QuranPackSamples/qul-core-sample/layout_words.json`
- `Athkar2/QuranPackSamples/qul-core-sample/mushaf_pages.json`
- `Athkar2/QuranPackSamples/qul-core-sample/mushaf_words.json`

For full 604-page Mushaf, host QUL SQLite resources and reference them with:

- `mushaf_layout_sqlite_file`
- `mushaf_script_sqlite_file`

## QUL pipeline recommendation

1. Pull selected resources from QUL (script/translation/tafsir/audio/layout).
2. Normalize into this app schema.
3. Generate versioned packs and upload to CDN.
4. Update manifest with new version numbers.
5. In app, open Quran tab -> Sync -> install the pack.

## Notes

- This app implementation does not call any non-public QUL API.
- Split packs by language/tafsir/reciter/layout so downloads stay manageable.
