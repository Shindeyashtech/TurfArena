# TODO: Fix TurfsList Map Error

- [x] Modify `fetchTurfs` in `src/pages/TurfsList.js` to check if `res.data` and `res.data.turfs` exist before setting `turfs`. If not, set to `[]`.
- [x] In the catch block of `fetchTurfs`, set `turfs` to `[]` to ensure it's always an array.
- [x] Run the app to verify the error is fixed and turfs load properly.
