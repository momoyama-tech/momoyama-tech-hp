declare namespace React {
	type FC<P = {}> = (props: P) => any;
	type ReactNode = any;
	type FormEvent<T = Element> = any;
	type MouseEvent<T = Element> = any;
	type ChangeEvent<T = Element> = any;
	type RefObject<T = any> = { current: T | null };

	function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
	function useRef<T = any>(initialValue?: T | null): RefObject<T>;
	function useState<T = any>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
}

declare module 'react' {
	export = React;
	export as namespace React;
}

declare module 'react/jsx-runtime' {
	export const jsx: any;
	export const jsxs: any;
	export const Fragment: any;
}

declare module 'lucide-react' {
	export const ArrowRight: any;
	export const ArrowUpRight: any;
	export const Code2: any;
	export const Film: any;
	export const GraduationCap: any;
	export const Rocket: any;
	export const Terminal: any;
	export const Sparkles: any;
	export const Users: any;
	export const Cpu: any;
	export const Loader2: any;
	export const CheckCircle2: any;
	export const AlertCircle: any;
	export const Mail: any;
	export const Layers: any;
	export const ChevronDown: any;
	export const Play: any;
}

declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}
}
