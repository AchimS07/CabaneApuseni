import { redirect } from 'next/navigation';
export default function NewListingPage() { redirect('/dashboard'); }
import Link from 'next/link';
import { useRequireRole } from '@/lib/hooks/useRequireRole';
import { uploadCabinPhoto } from '@/lib/storage';
import { FACILITIES } from '@/lib/constants';
import { createCabin } from '@/lib/firestore';

export default function NewListingPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useRequireRole('owner');
  const [title,       setTitle]       = useState('');
  const [location,    setLocation]    = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [facilities,  setFacilities]  = useState<string[]>([]);
  const [photos,      setPhotos]      = useState<string[]>([]);
  const [published,   setPublished]   = useState(false);
  const [uploading,   setUploading]   = useState(0);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const submitLabel = 'Create Listing';

  const toggleFacility = (id: string) =>
    setFacilities((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  const handlePhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadCabinPhoto(file);
        setPhotos((prev) => [...prev, url]);
      } catch {
        setErrors((prev) => ({ ...prev, photos: 'Failed to upload photo. Try again.' }));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())       errs.title    = 'Title is required.';
    if (!location.trim())    errs.location = 'Location is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    const p = parseFloat(price);
    if (!price || isNaN(p) || p <= 0) errs.price = 'Enter a valid price greater than 0.';
    if (photos.length === 0) errs.photos = 'At least one photo is required.';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!profile) return;
    setErrors({}); setSaving(true);
    try {
      await createCabin({
        ownerId: profile.uid,
        title: title.trim(), location: location.trim(), description: description.trim(),
        basePricePerNight: parseFloat(price), facilities, photos,
        published, hidden: false,
      });
      router.push('/owner/listings');
    } catch { setErrors({ form: 'Failed to save listing. Please try again.' }); }
    finally   { setSaving(false); }
  };

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/owner/listings" className="text-forest-700 hover:text-forest-900 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-stone-800">New Listing</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="label">Title *</label>
          <input id="title" type="text" required className="input-field"
            placeholder="e.g. Rustic Log Cabin in the Pines"
            value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="error-msg" role="alert">{errors.title}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="label">Location *</label>
          <input id="location" type="text" required className="input-field"
            placeholder="e.g. Stâna de Vale, Bihor County"
            value={location} onChange={(e) => setLocation(e.target.value)} />
          {errors.location && <p className="error-msg" role="alert">{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">Description *</label>
          <textarea id="description" rows={5} required className="input-field resize-none"
            placeholder="Describe your cabin – surroundings, best features, nearby activities…"
            value={description} onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <p className="error-msg" role="alert">{errors.description}</p>}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="label">Base price per night (€) *</label>
          <input id="price" type="number" min="1" step="1" required className="input-field"
            placeholder="e.g. 120"
            value={price} onChange={(e) => setPrice(e.target.value)} />
          {errors.price && <p className="error-msg" role="alert">{errors.price}</p>}
        </div>

        {/* Facilities */}
        <fieldset>
          <legend className="label mb-2">Facilities</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FACILITIES.map((f) => (
              <label
                key={f.id}
                className={
                  'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ' +
                  (facilities.includes(f.id)
                    ? 'border-forest-600 bg-forest-50 text-forest-800'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600')
                }
              >
                <input type="checkbox" className="rounded text-forest-600 focus:ring-forest-500"
                  checked={facilities.includes(f.id)} onChange={() => toggleFacility(f.id)} />
                <span aria-hidden="true">{f.icon}</span>
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Photos */}
        <div>
          <p className="label mb-2">Photos *</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
                <Image src={url} alt={'Photo ' + (idx + 1)} fill className="object-cover" sizes="160px" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  aria-label={'Remove photo ' + (idx + 1)}
                >
                  ×
                </button>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={'up-' + i} className="aspect-square rounded-lg bg-stone-100 animate-pulse flex items-center justify-center">
                <span className="text-stone-400 text-xs">Uploading…</span>
              </div>
            ))}
          </div>
          <label htmlFor="photos-input" className="btn-secondary cursor-pointer inline-flex">
            + Add Photos
            <input id="photos-input" type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotos} />
          </label>
          {errors.photos && <p className="error-msg mt-2" role="alert">{errors.photos}</p>}
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished((v) => !v)}
            className={
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-600 ' +
              (published ? 'bg-forest-600' : 'bg-stone-300')
            }
          >
            <span className={
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ' +
              (published ? 'translate-x-6' : 'translate-x-1')
            } />
          </button>
          <span className="text-sm font-medium text-stone-700">
            {published ? 'Published – visible to guests' : 'Draft – not visible to guests'}
          </span>
        </div>

        {errors.form && <p className="error-msg" role="alert">{errors.form}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading > 0} className="btn-primary flex-1 justify-center">
            {saving ? 'Saving…' : uploading > 0 ? 'Uploading photos…' : submitLabel}
          </button>
          <Link href="/owner/listings" className="btn-secondary flex-1 justify-center text-center">Cancel</Link>
        </div>
      </form>

    </div>
  );
}
