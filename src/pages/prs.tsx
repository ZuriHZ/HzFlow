import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconBrandGithub,
    IconRefresh,
    IconExternalLink,
    IconLogout,
    IconCopy,
    IconCheck,
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

interface DeviceFlowState {
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
}

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
    const parsed = parseOwnerRepo(pr.htmlUrl);

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

// ── Device Flow Panel ──

function DeviceFlowPanel({
    flow,
    onCancel,
}: {
    flow: DeviceFlowState;
    onCancel: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const remaining = Math.max(0, flow.expiresIn - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(flow.userCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = () => {
        window.electronAPI.github.openExternal(flow.verificationUri);
    };

    return (
        <motion.div
            {...fadeUp}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500">
                <IconBrandGithub size={32} className="text-white" />
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-white/90">
                    Autenticar con GitHub
                </h3>
                <p className="mt-1 text-sm text-white/40">
                    Ingresa el siguiente codigo en tu navegador
                </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3">
                <span className="font-mono text-2xl font-bold tracking-[0.3em] text-white/90">
                    {flow.userCode}
                </span>
                <button
                    onClick={handleCopy}
                    className="ml-2 rounded-lg p-1.5 text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
                    title="Copiar codigo"
                >
                    {copied ? (
                        <IconCheck size={16} className="text-green-400" />
                    ) : (
                        <IconCopy size={16} />
                    )}
                </button>
            </div>

            <button
                onClick={handleVerify}
                className="flex items-center gap-2 text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
                <IconExternalLink size={14} />
                Abrir {flow.verificationUri}
            </button>

            <div className="flex items-center gap-2 text-xs text-white/30">
                <IconLoader2 size={12} className="animate-spin" />
                Esperando confirmacion... {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <button
                onClick={onCancel}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs text-white/40 transition-all hover:bg-white/5 hover:text-white/60"
            >
                <IconX size={14} />
                Cancelar
            </button>
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
    const [deviceFlow, setDeviceFlow] = useState<DeviceFlowState | null>(null);
    const [prs, setPrs] = useState<GithubPrListItem[]>([]);
    const [selectedPr, setSelectedPr] = useState<GithubPrDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [searchQuery, setSearchQuery] = useState("");

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Auth check on mount ──

    useEffect(() => {
        checkAuth();
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
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
            } else if (msg.includes("UNAUTHENTICATED") || msg.includes("ACCESS_DENIED")) {
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

    // ── Device Flow ──

    const startDeviceFlow = async () => {
        setError(null);
        try {
            const flow = await window.electronAPI.github.deviceFlowStart();
            setDeviceFlow(flow);

            // Start polling
            pollRef.current = setInterval(async () => {
                try {
                    const result = await window.electronAPI.github.deviceFlowWait();
                    if (result.authenticated) {
                        setAuthStatus(result);
                        setDeviceFlow(null);
                        if (pollRef.current) clearInterval(pollRef.current);
                        loadPrs("all");
                    }
                } catch {
                    // deviceFlowWait rejected = still waiting or expired
                }
            }, (flow.interval || 5) * 1000);
        } catch {
            setError("Error al iniciar Device Flow. Intenta de nuevo.");
        }
    };

    const cancelDeviceFlow = async () => {
        if (pollRef.current) clearInterval(pollRef.current);
        setDeviceFlow(null);
        try {
            await window.electronAPI.github.deviceFlowCancel();
        } catch {
            // ignore
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

    // ── Render: Not Authenticated ──

    if (!authStatus.authenticated && !deviceFlow) {
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
                    className="flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-12"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04]">
                        <IconBrandGithub size={40} className="text-white/20" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white/80">
                            Conecta tu cuenta de GitHub
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-white/40">
                            Autenticate para ver y gestionar tus Pull Requests
                            directamente desde la app.
                        </p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
                            <IconAlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    <button
                        onClick={startDeviceFlow}
                        className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-6 py-3 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/30"
                    >
                        <IconBrandGithub size={16} />
                        Autenticar con GitHub
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Render: Device Flow ──

    if (deviceFlow) {
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
                                Autenticacion en progreso
                            </p>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]" />
                </motion.section>

                <AnimatePresence mode="wait">
                    <DeviceFlowPanel
                        key="device-flow"
                        flow={deviceFlow}
                        onCancel={cancelDeviceFlow}
                    />
                </AnimatePresence>
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
