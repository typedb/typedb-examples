import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceContext } from "../service/ServiceContext";
import { Page } from "../model/Page";
import { User } from "../model/User";
import { Organization } from "../model/Organization";
import { Group } from "../model/Group";

const genderOptions = ["male", "female", "other"];
const relationshipStatusOptions = ["single", "relationship", "engaged", "married", "complicated"];
const pageVisibilityOptions = ["public", "private"];
const postVisibilityOptions = ["default", "public", "private"];

export default function CreatePage() {
  const [type, setFormType] = useState<'person' | 'organization' | 'group'>('person');
  // Common fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);
  // Profile fields (person/org)
  const [id, setId] = useState('');
  const [canPublish, setCanPublish] = useState(false);
  // Person fields
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [pageVisibility, setPageVisibility] = useState('public');
  const [postVisibility, setPostVisibility] = useState('default');
  // Organization/group fields
  const [tags, setTags] = useState<string[]>([]);
  // Group fields
  // (group-id is auto-generated)

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const serviceContext = React.useContext(ServiceContext);

  function handleTagChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean));
  }

  async function handleProfilePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingPic(true);
    setProfilePicturePreview(URL.createObjectURL(file));
    try {
      const mediaId = await serviceContext.uploadMedia(file);
      setProfilePicture(mediaId);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setProfilePicturePreview(null);
      setProfilePicture('');
    } finally {
      setUploadingPic(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    // Build payload based on type
    const payload: Partial<Page> = {
      name,
      bio,
      profilePicture,
      badge,
      isActive,
    };
    let promise;
    if (type === 'person') {
      const userPayload: Partial<User> = {
        ...payload,
        type: undefined,
        username: id,
        gender,
        language,
        email,
        phone,
        relationshipStatus,
        pageVisibility,
        postVisibility,
        canPublish,
      }
      promise = serviceContext.createUser(userPayload);
    } else if (type === 'organization') {
      const orgPayload: Partial<Organization> = {
        ...payload,
        type: undefined,
        username: id,
        canPublish,
        tags,
      }
      promise = serviceContext.createOrganization(orgPayload);
    } else if (type === 'group') {
      const groupPayload: Partial<Group> = {
        ...payload,
        type: undefined,
        id,
        pageVisibility,
        postVisibility,
        tags,
      }
      promise = serviceContext.createGroup(groupPayload);
    } else {
      throw new Error('Invalid page type');
    }
    promise
      .then(() => {
        setFormLoading(false);
        if (type === 'person') navigate(`/user/${id}`);
        else if (type === 'organization') navigate(`/organization/${id}`);
        else if (type === 'group') navigate(`/group/${id}`);
        else navigate('/');
      })
      .catch(e => {
        setFormError(e.message);
        setFormLoading(false);
      });
  }

  return (
    <div className="App-container">
      <h2>Create New Page</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, maxWidth: 600 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignItems: 'center',
        }}>
          <label style={{ gridColumn: '1 / -1' }}>
            Type:
            <select value={type} onChange={e => setFormType(e.target.value as any)} style={{ marginLeft: 4 }}>
              <option value="person">User</option>
              <option value="organization">Organization</option>
              <option value="group">Group</option>
            </select>
          </label>

          <label>
            {type === 'group' ? "ID:" : "Username:"}
            <input value={id} onChange={e => setId(e.target.value)} required style={{ marginLeft: 4, width: '100%' }} />
          </label>

          <label>
            Name:
            <input value={name} onChange={e => setName(e.target.value)} required style={{ marginLeft: 4, width: '100%' }} />
          </label>
          <label>
            Profile Picture:
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ marginLeft: 4 }} />
            {uploadingPic && <span style={{ color: '#888', marginLeft: 8 }}>Uploading...</span>}
            {uploadError && <span style={{ color: 'red', marginLeft: 8 }}>{uploadError}</span>}
            {profilePicturePreview && (
              <div style={{ marginTop: 8 }}>
                <img src={profilePicturePreview} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
            )}
          </label>
          <label>
            Badge:
            <input value={badge} onChange={e => setBadge(e.target.value)} style={{ marginLeft: 4, width: '100%' }} />
          </label>
          <label>
            Is Active:
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ marginLeft: 4 }} />
          </label>

          {type === 'person' && (
            <>
              <label>
                Gender:
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ marginLeft: 4, width: '100%' }}>
                  <option value="">--</option>
                  {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label>
                Language:
                <input value={language} onChange={e => setLanguage(e.target.value)} style={{ marginLeft: 4, width: '100%' }} />
              </label>
              <label>
                Email:
                <input value={email} onChange={e => setEmail(e.target.value)} style={{ marginLeft: 4, width: '100%' }} />
              </label>
              <label>
                Phone:
                <input value={phone} onChange={e => setPhone(e.target.value)} style={{ marginLeft: 4, width: '100%' }} />
              </label>
              <label>
                Relationship Status:
                <select value={relationshipStatus} onChange={e => setRelationshipStatus(e.target.value)} style={{ marginLeft: 4, width: '100%' }}>
                  <option value="">--</option>
                  {relationshipStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label>
                Can Publish:
                <input type="checkbox" checked={canPublish} onChange={e => setCanPublish(e.target.checked)} style={{ marginLeft: 4 }} />
              </label>
            </>
          )}
          {type === 'organization' && (
            <>
              <label>
                Can Publish:
                <input type="checkbox" checked={canPublish} onChange={e => setCanPublish(e.target.checked)} style={{ marginLeft: 4 }} />
              </label>
            </>
          )}
          {(type === 'organization' || type === 'group') && (
            <>
              <label>
                Tags (comma separated):
                <input value={tags.join(', ')} onChange={handleTagChange} style={{ marginLeft: 4, width: '100%' }} />
              </label>
            </>
          )}
          {type === 'person' && (
            <><label /></> // empty slot to nudge layout
          )}
          {(type === 'person' || type === 'group') && (
            <>
              <label>
                Page Visibility:
                <select value={pageVisibility} onChange={e => setPageVisibility(e.target.value)} style={{ marginLeft: 4, width: '100%' }}>
                  {pageVisibilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label>
                Post Visibility:
                <select value={postVisibility} onChange={e => setPostVisibility(e.target.value)} style={{ marginLeft: 4, width: '100%' }}>
                  {postVisibilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
            </>
          )}
        </div>
        <label style={{ display: 'block', marginTop: 16 }}>
          Bio:
          <textarea value={bio} onChange={e => setBio(e.target.value)} required rows={4} style={{ marginLeft: 4, width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 15, padding: 6, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </label>
        <button type="submit" disabled={formLoading} style={{ padding: '6px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer', marginTop: 16, width: '100%' }}>
          {formLoading ? 'Creating...' : 'Create'}
        </button>
        {formError && <span style={{ color: 'red', marginLeft: 8 }}>{formError}</span>}
      </form>
      <button onClick={() => navigate('/')} style={{ background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '1em' }}>← Back to Home</button>
    </div>
  );
} 
