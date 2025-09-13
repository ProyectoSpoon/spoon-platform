// Temporal shims to avoid type errors from external shared package during web typecheck.
// TODO: Reemplazar por tipos reales exportados desde packages/shared cuando estén listos.

declare module '@spoon/shared' {
	const mod: any;
	export = mod;
}
declare module '@spoon/shared/*' {
	const mod: any;
	export = mod;
}
declare module 'packages/*' {
	const mod: any;
	export = mod;
}
