# Avatar Upload Specification

## Purpose

Upload user avatar images to Supabase Storage. Integrated as `<AvatarUpload>` sub-component within `UserProfileForm`. Single file per user; re-uploads overwrite the previous avatar.

## Requirements

### Requirement: Avatar Upload Component

The system MUST provide an `<AvatarUpload>` component with a file picker, a live preview of the selected image, and an upload-to-storage action. It SHALL accept `userId: string` and `onUploadComplete: (url: string) => void` props.

#### Scenario: Select and preview an image

- GIVEN the avatar upload component rendered for user `alice`
- WHEN the user selects a valid JPEG file (under 2 MB)
- THEN a live preview of the selected image appears
- AND the preview updates on subsequent selections before upload

#### Scenario: Upload and persist

- GIVEN a selected valid image file and preview confirmed
- WHEN the user triggers the upload action
- THEN the file is stored at `{user_id}/avatar.{ext}` in the `avatars` bucket
- AND the resulting public URL is persisted as `avatar_url` in `user_profiles`
- AND `onUploadComplete(url)` is called with the new URL

#### Scenario: Re-upload overwrites previous avatar

- GIVEN user `alice` already has an avatar at `alice/avatar.jpg`
- WHEN a new avatar image is uploaded
- THEN the new file overwrites the existing file at the same path
- AND `avatar_url` in `user_profiles` is updated to the new URL

### Requirement: Client-Side Validation

The system MUST validate file type and size on the client before upload. Allowed types: `image/jpeg`, `image/png`, `image/webp`. Maximum size: 2 MB. Invalid files MUST be rejected with a user-visible error message.

#### Scenario: Valid file accepted

- GIVEN a file of type `image/jpeg` and size 1.5 MB
- WHEN the user selects it
- THEN the file is accepted and preview renders

#### Scenario: Invalid type rejected

- GIVEN a file of type `application/pdf`
- WHEN the user selects it
- THEN the file is rejected with message "Solo se permiten imágenes (JPEG, PNG, WebP)"

#### Scenario: Oversized file rejected

- GIVEN a file of type `image/png` and size 3 MB
- WHEN the user selects it
- THEN the file is rejected with message "La imagen no debe superar 2 MB"

### Requirement: Storage Security

The `avatars` Supabase Storage bucket MUST be configured with public-read and authenticated-write policies. Unauthenticated users MUST NOT be able to upload files.

#### Scenario: Authenticated upload succeeds

- GIVEN an authenticated user uploading an avatar
- WHEN the upload executes against the `avatars` bucket
- THEN the file is stored successfully

#### Scenario: Unauthenticated upload fails

- GIVEN an unauthenticated user attempting to upload to the `avatars` bucket
- WHEN the upload executes
- THEN the request is denied by Supabase Storage RLS
