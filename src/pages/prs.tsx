import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconBrandGithub,
    IconRefresh,
    IconExternalLink,
    IconLogout,
    IconLoader2,
    IconGitPullRequest,
    IconGitMerge,
    IconGitBranch,
    IconAlertCircle,
    IconSearch,
    IconClock,
    IconFilter,
    IconX,
    IconChevronRight,
    IconUser,
    IconUsers,
    IconEye,
    IconKey,
    IconEyeOff,
    IconAlertTriangle,
    IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ── Helpers ──

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const seconds = Math.floor((now - then) / 1000);
    if (seconds < 60) return "hace un momento";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days}d`;
    const months = Math.floor(days / 30);
    return `hace ${months}mes`;
}

function parseOwnerRepo(htmlUrl: string): { owner: string; repo: string } | null {
    const match = htmlUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    return match ? { owner: match[1], repo: match[2] } : null;
}

// ── Types ──

type ViewMode = "list" | "detail";
type FilterTab = "all" | "created" | "assigned" | "review-requested";

// ── Animations ──

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

// ── Status Badge ──

function PrStatusBadge({
    state,
    merged,
    draft,
}: {
    state: string;
    merged?: boolean;
    draft?: boolean;
}) {
    if (draft) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50">
                Borrador
            </span>
        );
    }
    if (merged) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                <IconGitMerge size={10} />
                Mergeado
            </span>
        );
    }
    if (state === "open") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-300">
                Abierto
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-300">
            Cerrado
        </span>
    );
}

// ── PR Card ──

function PrCard({
    pr,
    onClick,
}: {
    pr: GithubPrListItem;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-colors hover:border-white/10 hover:bg-white/[0.04]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <IconGitPullRequest
                            size={16}
                            className={cn(
                                "shrink-0",
                                pr.state === "open" ? "text-green-400" : pr.merged ? "text-purple-400" : "text-red-400",
                            )}
                        />
                        <span className="truncate text-sm font-medium text-white/90">
                            {pr.title}
                        </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/40">
                        <span className="truncate">{pr.repository}</span>
                        <span>·</span>
                        <span>#{pr.number}</span>
                        <span>·</span>
                        <span>{pr.author}</span>
                    </div>
                </div>
                <PrStatusBadge state={pr.state} merged={pr.merged} draft={pr.draft} />
            </div>

            {pr.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {pr.labels.map((label) => (
                        <span
                            key={label}
                            className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-300/70"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-2 flex items-center justify-between text-[10px] text-white/25">
                <div className="flex items-center gap-1">
                    <IconClock size={10} />
                    {timeAgo(pr.updatedAt)}
                </div>
                <IconChevronRight size={12} className="text-white/20" />
            </div>
        </motion.button>
    );
}

// ── PR Detail ──

function PrDetail({
    pr,
    onBack,
}: {
    pr: GithubPrDetail;
    onBack: () => void;
}) {
    const handleOpenInGitHub = () => {
        window.electronAPI.github.openExternal(pr.htmlUrl);
    };

    return (
        <motion.div
            {...fadeUp}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 self-start text-xs text-white/40 transition-colors hover:text-white/70"
            >
                ← Volver a la lista
            </button>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <IconGitPullRequest
                                size={18}
                                className={cn(
                                    "shrink-0",
                                    pr.state === "open" ? "text-green-400" : pr.merged ? "text-purple-400" : "text-red-400",
                                )}
                            />
                            <h2 className="text-lg font-semibold text-white/90">
                                {pr.title}
                            </h2>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                            <span>{pr.repository}</span>
                            <span>·</span>
                            <span>#{pr.number}</span>
                        </div>
                    </div>
                    <PrStatusBadge state={pr.state} merged={pr.merged} draft={pr.draft} />
                </div>

                {pr.body && (
                    <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                            {pr.body}
                        </p>
                    </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <div className="text-white/30">Autor</div>
                        <div className="mt-1 flex items-center gap-1.5 text-white/70">
                            <IconUser size={12} />
                            {pr.author}
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <div className="text-white/30">Creado</div>
                        <div className="mt-1 text-white/70">
                            {new Date(pr.createdAt).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <div className="text-white/30">Actualizado</div>
                        <div className="mt-1 text-white/70">{timeAgo(pr.updatedAt)}</div>
                    </div>
                    {pr.baseRef && (
                        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <div className="text-white/30">Base</div>
                            <div className="mt-1 flex items-center gap-1 text-white/70">
                                <IconGitBranch size={12} />
                                {pr.baseRef}
                            </div>
                        </div>
                    )}
                    {pr.headRef && (
                        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <div className="text-white/30">Head</div>
                            <div className="mt-1 flex items-center gap-1 text-white/70">
                                <IconGitBranch size={12} />
                                {pr.headRef}
                            </div>
                        </div>
                    )}
                    {pr.checksSummary && (
                        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <div className="text-white/30">Checks</div>
                            <div className="mt-1 text-white/70">
                                {pr.checksSummary.state}{" "}
                                {pr.checksSummary.totalCount != null &&
                                    `(${pr.checksSummary.totalCount})`}
                            </div>
                        </div>
                    )}
                </div>

                {pr.labels.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {pr.labels.map((label) => (
                            <span
                                key={label}
                                className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300/70"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleOpenInGitHub}
                        className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.1] hover:text-white/90"
                    >
                        <IconExternalLink size={14} />
                        Abrir en GitHub
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ── Filter Tabs ──

const FILTER_TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Todos", icon: <IconFilter size={12} /> },
    { key: "created", label: "Creados por mi", icon: <IconUser size={12} /> },
    { key: "assigned", label: "Asignados", icon: <IconUsers size={12} /> },
    { key: "review-requested", label: "Review pedido", icon: <IconEye size={12} /> },
];

// ── Main Page ──

export default function Prs() {
    const [authStatus, setAuthStatus] = useState<GithubAuthStatus>({ authenticated: false });
    const [prs, setPrs] = useState<GithubPrListItem[]>([]);
    const [selectedPr, setSelectedPr] = useState<GithubPrDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [searchQuery, setSearchQuery] = useState("");

    const [tokenInput, setTokenInput] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // ── Auth check on mount ──

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const status = await window.electronAPI.github.getStatus();
            setAuthStatus(status);
            if (status.authenticated) {
                loadPrs("all");
            }
        } catch {
            setAuthStatus({ authenticated: false });
        } finally {
            setIsInitialLoading(false);
        }
    };

    // ── Load PRs ──

    const loadPrs = async (filter: FilterTab) => {
        setIsLoading(true);
        setError(null);
        try {
            const filterParam: GithubListFilter =
                filter === "all"
                    ? { involvement: "involved" }
                    : { involvement: filter as GithubListFilter["involvement"] };
            const data = await window.electronAPI.github.prsList(filterParam);
            setPrs(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("RATE_LIMITED")) {
                setError("Rate limit de GitHub alcanzado. Intenta mas tarde.");
            } else if (msg.includes("UNAUTHENTICATED")) {
                setError("Sesion expirada. Vuelve a autenticarte.");
                setAuthStatus({ authenticated: false });
            } else if (msg.includes("NETWORK")) {
                setError("Error de red. Verifica tu conexion a internet.");
            } else {
                setError("Error al cargar los PRs: " + msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── Login with PAT ──

    const handlePatLogin = async () => {
        if (!tokenInput.trim()) return;
        setError(null);
        setIsLoadingAuth(true);
        try {
            const result = await window.electronAPI.github.loginPat(tokenInput.trim());
            setAuthStatus(result);
            setTokenInput("");
            setShowToken(false);
            loadPrs("all");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("401") || msg.includes("Bad credentials")) {
                setError("Token invalido. Verifica que sea un Personal Access Token valido.");
            } else if (msg.includes("NETWORK")) {
                setError("Error de red. Verifica tu conexion a internet.");
            } else {
                setError("Error al autenticar: " + msg);
            }
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const handlePatKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handlePatLogin();
        }
    };

    // ── Logout ──

    const handleLogout = async () => {
        try {
            await window.electronAPI.github.logout();
            setAuthStatus({ authenticated: false });
            setPrs([]);
            setSelectedPr(null);
            setViewMode("list");
        } catch {
            // ignore
        }
    };

    // ── Filter change ──

    const handleFilterChange = (filter: FilterTab) => {
        setActiveFilter(filter);
        setSelectedPr(null);
        setViewMode("list");
        loadPrs(filter);
    };

    // ── PR selection ──

    const handlePrClick = async (pr: GithubPrListItem) => {
        setIsLoadingDetail(true);
        setViewMode("detail");
        try {
            const parsed = parseOwnerRepo(pr.htmlUrl);
            if (!parsed) throw new Error("URL invalida");
            const detail = await window.electronAPI.github.prsGet(
                parsed.owner,
                parsed.repo,
                pr.number,
            );
            setSelectedPr(detail);
        } catch {
            setError("Error al cargar el detalle del PR.");
            setViewMode("list");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // ── Refresh ──

    const handleRefresh = () => {
        loadPrs(activeFilter);
    };

    // ── Filtered + searched PRs ──

    const filteredPrs = prs.filter((pr) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            pr.title.toLowerCase().includes(q) ||
            pr.repository.toLowerCase().includes(q) ||
            pr.author.toLowerCase().includes(q)
        );
    });

    // ── Initial loading state (auth check not yet completed) ──

    if (isInitialLoading) {
        return (
            <div className="flex flex-col gap-6">
                <motion.section
                    {...fadeUp}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <IconBrandGithub size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">
                                GitHub PRs
                            </h1>
                            <p className="text-sm text-white/40">
                                Verificando sesión...
                            </p>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
                </motion.section>

                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-12"
                >
                    <IconLoader2 size={32} className="animate-spin text-violet-400" />
                </motion.div>
            </div>
        );
    }

    // ── Loading state ──

    if (isLoadingAuth) {
        return (
            <div className="flex flex-col gap-6">
                <motion.section
                    {...fadeUp}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <IconBrandGithub size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">
                                GitHub PRs
                            </h1>
                            <p className="text-sm text-white/40">
                                Conectando con GitHub...
                            </p>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
                </motion.section>

                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-12"
                >
                    <IconLoader2 size={32} className="animate-spin text-violet-400" />
                    <p className="text-sm text-white/40">
                        Validando token...
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── Render: Not Authenticated ──

    if (!authStatus.authenticated) {
        return (
            <div className="flex flex-col gap-6">
                <motion.section
                    {...fadeUp}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <IconBrandGithub size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">
                                GitHub PRs
                            </h1>
                            <p className="text-sm text-white/40">
                                Gestiona tus Pull Requests de GitHub
                            </p>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
                </motion.section>

                <motion.div
                    {...fadeUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-12"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04]">
                        <IconBrandGithub size={40} className="text-white/20" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white/80">
                            Conectar con GitHub
                        </h3>
                        <div className="mt-3 max-w-sm space-y-2 text-sm text-white/40">
                            <p>1. Andá a <a
                                href="https://github.com/settings/tokens"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.electronAPI.github.openExternal("https://github.com/settings/tokens");
                                }}
                                className="inline-flex items-center gap-1 text-violet-400 underline decoration-violet-400/30 underline-offset-2 transition-colors hover:text-violet-300"
                            >github.com/settings/tokens</a></p>
                            <p>2. Creá un token con permisos <span className="font-medium text-white/60">'repo'</span></p>
                            <p>3. Pegalo abajo</p>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
                            <IconAlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Security warning */}
                    <div className="w-full max-w-sm rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
                            <div className="space-y-2 text-xs leading-relaxed text-amber-300">
                                <p className="text-sm font-semibold text-amber-200">Acerca de la seguridad</p>
                                <ul className="list-inside list-disc space-y-1 text-amber-300/80">
                                    <li>Tu token se almacena localmente en tu computadora, cifrado con la seguridad de tu sistema.</li>
                                    <li>El token permite acceder a tus repositorios de GitHub — trátalo como una contraseña.</li>
                                    <li>Te recomendamos crear un token con solo los permisos que necesitas (mínimo: scope <code className="rounded bg-amber-500/10 px-1 py-0.5 text-amber-200">repo</code> para leer PRs).</li>
                                    <li>Podés revocar el token en cualquier momento desde <a
                                        href="https://github.com/settings/tokens"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.electronAPI.github.openExternal("https://github.com/settings/tokens");
                                        }}
                                        className="underline decoration-amber-400/30 underline-offset-2 transition-colors hover:text-amber-200"
                                    >github.com/settings/tokens</a></li>
                                    <li>El token <strong className="text-amber-200">NUNCA</strong> se envía a ningún servidor excepto a <code className="rounded bg-amber-500/10 px-1 py-0.5 text-amber-200">api.github.com</code>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Scopes info */}
                    <div className="w-full max-w-sm rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
                        <div className="flex items-start gap-3">
                            <IconInfoCircle size={18} className="mt-0.5 shrink-0 text-violet-400" />
                            <div className="space-y-1.5 text-xs leading-relaxed text-violet-300/80">
                                <p className="text-sm font-semibold text-violet-200">Permisos necesarios</p>
                                <ul className="list-inside list-disc space-y-1">
                                    <li><code className="rounded bg-violet-500/10 px-1 py-0.5 text-violet-200">repo</code> — Acceso completo a repositorios privados (requerido).</li>
                                    <li><code className="rounded bg-violet-500/10 px-1 py-0.5 text-violet-200">public_repo</code> — Suficiente solo para repositorios públicos.</li>
                                </ul>
                                <p className="text-violet-300/60">El token se usa únicamente para leer tus Pull Requests vía la API de GitHub.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-sm">
                        <div className="relative">
                            <IconKey
                                size={16}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-white/25"
                            />
                            <input
                                type={showToken ? "text" : "password"}
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                onKeyDown={handlePatKeyDown}
                                placeholder="ghp_xxxxxxxxxxxx"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pr-10 pl-10 text-sm text-white/80 placeholder-white/25 outline-none transition-all focus:border-violet-500/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/30 transition-colors hover:text-white/60"
                            >
                                {showToken ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </button>
                        </div>

                        <button
                            onClick={handlePatLogin}
                            disabled={!tokenInput.trim()}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/20 px-6 py-3 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <IconBrandGithub size={16} />
                            Conectar
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Render: Authenticated ──

    const user = authStatus.authenticated ? authStatus.user : null;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <motion.section
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-8"
            >
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <IconBrandGithub size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">
                                GitHub PRs
                            </h1>
                            <p className="text-sm text-white/40">
                                {user ? `Conectado como ${user.login}` : "Pull Requests de GitHub"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition-all hover:bg-white/[0.06] hover:text-white/80 disabled:opacity-40"
                        >
                            <IconRefresh
                                size={14}
                                className={cn(isLoading && "animate-spin")}
                            />
                            Actualizar
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition-all hover:bg-red-500/10 hover:text-red-400"
                        >
                            <IconLogout size={14} />
                            Salir
                        </button>
                    </div>
                </div>
                <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
            </motion.section>

            {/* Error banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        {...fadeIn}
                        className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        <IconAlertCircle size={16} className="shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="rounded p-1 text-red-400/60 hover:text-red-300"
                        >
                            <IconX size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
                {viewMode === "list" ? (
                    <motion.div
                        key="list"
                        {...fadeUp}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Filter tabs + search */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex gap-1">
                                {FILTER_TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleFilterChange(tab.key)}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                                            activeFilter === tab.key
                                                ? "bg-violet-500/20 text-violet-300"
                                                : "text-white/40 hover:bg-white/[0.04] hover:text-white/60",
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex-1 sm:ml-auto sm:max-w-xs">
                                <IconSearch
                                    size={14}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar PRs..."
                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pr-3 pl-8 text-xs text-white/80 placeholder-white/30 outline-none transition-all focus:border-violet-500/50"
                                />
                            </div>
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/30">
                                <IconLoader2 size={16} className="animate-spin" />
                                Cargando PRs...
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoading && filteredPrs.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <IconGitPullRequest
                                    size={40}
                                    className="text-white/10"
                                />
                                <div>
                                    <p className="text-sm text-white/30">
                                        No hay PRs
                                    </p>
                                    <p className="mt-1 text-xs text-white/20">
                                        {searchQuery
                                            ? "No se encontraron resultados para tu busqueda"
                                            : "No se encontraron Pull Requests con este filtro"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* PR list */}
                        {!isLoading && filteredPrs.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {filteredPrs.map((pr) => (
                                    <PrCard
                                        key={pr.id}
                                        pr={pr}
                                        onClick={() => handlePrClick(pr)}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        {...fadeUp}
                        transition={{ duration: 0.3 }}
                    >
                        {isLoadingDetail ? (
                            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/30">
                                <IconLoader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Cargando detalle...
                            </div>
                        ) : selectedPr ? (
                            <PrDetail
                                pr={selectedPr}
                                onBack={() => {
                                    setViewMode("list");
                                    setSelectedPr(null);
                                }}
                            />
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
