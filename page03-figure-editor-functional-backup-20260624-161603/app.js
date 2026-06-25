// ==================== 全局状态 ====================
let scenes = [];
let characters = [];
let currentProject = null;
let currentProjectInfo = null;
let currentSegments = [];
let activeSegmentEditIndex = 0;
let activeProductionFlowStep = 'script';
let selectedScenes = new Set();
let selectedChars = new Set();
let activeVideoPollers = new Map();
let segmentProgressTimers = new Map();
let directorModes = [];
let directorModePassword = sessionStorage.getItem('directorModePassword') || '';
let directorModeUnlocked = false;
let promptLibrary = [];
let promptMentionSuggestState = {
    target: null,
    start: 0,
    end: 0,
    query: '',
    items: [],
    activeIndex: 0
};
let projectsCache = [];
let segmentProgressCache = new Map();
let inlineProgressTimers = new Map();
let assetsCache = [];
let assetBrowserState = {
    category: 'all',
    query: '',
    density: 'comfortable'
};
let promptLibraryState = {
    query: '',
    density: 'comfortable'
};
let workflowPaneState = {};
let workflowOutputPaneState = {};
let videoEditorSourcePath = '';
let pendingVideoEditorEdit = null;
let videoEditorUndoStack = [];
let videoEditorActiveJob = null;
let videoEditorProgressTimer = null;
let videoEditorTargetSegmentIndex = null;
let ue5JsonRoleSeq = 0;
let ue5JsonVideoObjectUrl = '';
let ue5JsonLastResult = null;
let ue5JsonLastFilename = '';
let ue5JsonPreparedFromProject = false;
let ue5JsonSourceFromProject = false;
let ue5JsonStateRestored = false;
let ue5JsonSaveTimer = null;
let ue5JsonLoadedProjectId = null;
let ue5JsonApplyingState = false;
let ue5JsonEditorState = {
    shotIndex: 0,
    cameraKeyIndex: 0,
    syncing: false
};
const VIDEO_FAKE_PROGRESS_MS = 12 * 60 * 1000;
const VIDEO_EDITOR_STORAGE_KEY = 'ai-video-editor-state-v1';
const REFERENCE3D_STORAGE_KEY = 'ai-reference-3d-scene-v1';
const UI_BACKGROUND_STORAGE_KEY = 'ai-ui-background-v1';
const DEFAULT_UI_BACKGROUND_IMAGE = '';
const STORYBOARD_PROMPTS_STORAGE_KEY = 'ai-storyboard-prompts-enabled-v1';
const UE5_JSON_STORAGE_KEY = 'ai-ue5-json-state-v1';
const REFERENCE3D_DEFAULT_FOV = 90;
const VISUAL_ICON_MAP = {
    '+': 'icon-plus',
    '＋': 'icon-plus',
    '↻': 'icon-refresh',
    '🔄': 'icon-refresh',
    '🧩': 'icon-split',
    '🚀': 'icon-run',
    '🧠': 'icon-ai',
    '📦': 'icon-package',
    '🎬': 'icon-video',
    '🎥': 'icon-video',
    '🎞️': 'icon-video',
    '🔗': 'icon-link',
    '✏️': 'icon-edit',
    '📝': 'icon-edit',
    '🗑': 'icon-delete',
    '🗑️': 'icon-delete',
    '🖼️': 'icon-storyboard',
    '📋': 'icon-storyboard',
    '📸': 'icon-camera',
    '⬇️': 'icon-download',
    '⬆️': 'icon-upload',
    '🔍': 'icon-search',
    '💾': 'icon-save',
    '🔌': 'icon-plug',
    '✨': 'icon-spark',
    '🎨': 'icon-palette',
    '⏳': 'icon-loading',
    '⏱': 'icon-clock',
    '⏱️': 'icon-clock',
    '📍': 'icon-pin',
    '👤': 'icon-person',
    '👥': 'icon-person',
    '✅': 'icon-check',
    '⚠': 'icon-warning',
    '⚠️': 'icon-warning',
    '❌': 'icon-close',
    '@': 'icon-mention',
    '✂️': 'icon-edit',
    '🎭': 'icon-ai',
    '🎯': 'icon-pin',
    '🙈': 'icon-close',
    '🧊': 'icon-3d',
    '📁': 'icon-package',
    '🗄️': 'icon-package',
    '💬': 'icon-mention',
    '⚙️': 'icon-ai'
};
const VISUAL_ICON_TOKENS = Object.keys(VISUAL_ICON_MAP).sort((a, b) => b.length - a.length);
let visualIconObserver = null;
let visualIconNormalizeQueued = false;
let reference3D = {
    initialized: false,
    loading: false,
    THREE: null,
    OrbitControls: null,
    TransformControls: null,
    GLTFLoader: null,
    renderer: null,
    scene: null,
    camera: null,
    orbit: null,
    transform: null,
    raycaster: null,
    pointer: null,
    selectable: [],
    mixers: [],
    selected: null,
    objectSeq: 1,
    animationId: null,
    resizeObserver: null,
    backgroundUrls: [],
    backdropMode: 'box',
    skyboxFiles: [null, null, null, null, null, null],
    skyboxPreviewUrls: [null, null, null, null, null, null],
    skyboxMesh: null,
    backgroundPlane: null,
    backgroundTexture: null,
    gridHelper: null,
    groundPlane: null,
    groundTextureUrl: null,
    groundVisible: true,
    gridVisible: true,
    ueControls: {
        enabled: false,
        yaw: 0,
        pitch: 0,
        speed: 4,
        keys: new Set(),
        lastTime: 0,
        pointerId: null,
        lastPointerX: null,
        lastPointerY: null
    },
    restoring: false,
    restored: false,
    saveTimer: null,
    ueJsonLink: null
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initUIBackgroundSettings();
    initStoryboardPromptToggle();
    initAdvancedGenerationSettings();
    renderWorkbenchDashboard();
    loadScenes();
    loadCharacters();
    loadSettings();
    initProjectBootstrap();
    loadDirectorModes();
    loadPromptLibrary();
    initPromptMentionInputs();
    checkFFmpegStatus();
    restoreVideoEditorState();
    initUe5JsonMode();
    showVersionAnnouncementOnOpen();
    initVisualIconSystem();
});

// ==================== 导航切换 ====================
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');

            // 切换时刷新数据
            if (tab === 'scenes') loadScenes();
            if (tab === 'characters') loadCharacters();
            if (tab === 'assets') loadAssets();
            if (tab === 'workbench') renderWorkbenchDashboard();
            if (tab === 'prompt-library') loadPromptLibrary();
            if (tab === 'projects') loadProjects();
            if (tab === 'video-editor') refreshVideoEditorPreview();
            if (tab === 'ue5-json') initUe5JsonMode();
            if (tab === 'script-breakdown') syncCurrentScriptToBreakdown();
            if (tab === 'script') { refreshChipSelects(); refreshPromptMentionBadges(); }
            if (tab === 'storyboard') refreshChipSelects();
            if (tab === 'video-editor') refreshChipSelects();
            if (tab === 'director-modes') loadDirectorModes();
            if (tab === 'reference-3d') initReference3DMode();
            syncWorkflowInputState(tab);
        });
    });
}

function switchToTab(tab) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
    if (tab === 'assets') loadAssets();
    if (tab === 'workbench') renderWorkbenchDashboard();
    if (tab === 'prompt-library') loadPromptLibrary();
    if (tab === 'projects') loadProjects();
    if (tab === 'video-editor') refreshVideoEditorPreview();
    if (tab === 'ue5-json') initUe5JsonMode();
    if (tab === 'script-breakdown') syncCurrentScriptToBreakdown();
    if (tab === 'director-modes') loadDirectorModes();
    if (tab === 'script') { refreshChipSelects(); refreshPromptMentionBadges(); }
    if (tab === 'storyboard') refreshChipSelects();
    if (tab === 'video-editor') refreshChipSelects();
    if (tab === 'reference-3d') initReference3DMode();
    syncWorkflowInputState(tab);
}

function getVisualIconClass(token) {
    return VISUAL_ICON_MAP[token] || '';
}

function findLeadingVisualIconToken(text = '') {
    const trimmed = String(text || '').trimStart();
    return VISUAL_ICON_TOKENS.find(token => trimmed.startsWith(token)) || '';
}

function getElementsForIconNormalization(root, selector) {
    const elements = [];
    if (!root) return elements;
    if (root.matches?.(selector)) elements.push(root);
    root.querySelectorAll?.(selector)?.forEach(el => elements.push(el));
    return elements;
}

function applySemanticIconClass(iconEl, iconClass) {
    if (!iconEl || !iconClass) return;
    Array.from(iconEl.classList || []).forEach(className => {
        if (className.startsWith('icon-')) iconEl.classList.remove(className);
    });
    iconEl.classList.add(iconClass);
    iconEl.textContent = '';
    iconEl.setAttribute?.('aria-hidden', 'true');
}

function makeSemanticIconElement(baseClass, iconClass) {
    const icon = document.createElement('span');
    icon.className = baseClass;
    applySemanticIconClass(icon, iconClass);
    return icon;
}

function normalizeExistingIconSpans(root, selector, baseClass) {
    getElementsForIconNormalization(root, selector).forEach(iconEl => {
        const token = findLeadingVisualIconToken(iconEl.textContent || '');
        const iconClass = getVisualIconClass(token);
        if (iconClass) applySemanticIconClass(iconEl, iconClass);
        if (!iconEl.classList.contains(baseClass)) iconEl.classList.add(baseClass);
    });
}

function normalizeLeadingTextIcon(element, baseClass) {
    if (!element) return;
    const hasDirectIcon = Array.from(element.children || []).some(child => child.classList?.contains(baseClass));
    if (hasDirectIcon) return;
    const textNode = Array.from(element.childNodes || []).find(node => node.nodeType === 3 && node.textContent.trim());
    if (!textNode) return;
    const token = findLeadingVisualIconToken(textNode.textContent);
    const iconClass = getVisualIconClass(token);
    if (!iconClass) return;
    textNode.textContent = textNode.textContent.trimStart().slice(token.length).replace(/^\s+/, '');
    element.insertBefore(makeSemanticIconElement(baseClass, iconClass), textNode);
}

function normalizeVisualIcons(root = document) {
    if (!root?.querySelectorAll && !root?.matches) return;
    normalizeExistingIconSpans(root, '.btn-icon', 'btn-icon');
    normalizeExistingIconSpans(root, '.header-icon', 'header-icon');
    normalizeExistingIconSpans(root, '.badge-icon', 'badge-icon');
    getElementsForIconNormalization(root, '.btn').forEach(btn => normalizeLeadingTextIcon(btn, 'btn-icon'));
    getElementsForIconNormalization(root, '.badge').forEach(badge => normalizeLeadingTextIcon(badge, 'badge-icon'));
    getElementsForIconNormalization(root, '.card-header h3, .segment-title, .storyboard-title, .merged-video-title, .video-editor-confirm-title, .collapsible-panel-summary > span:first-child')
        .forEach(title => normalizeLeadingTextIcon(title, 'header-icon'));
}

function scheduleVisualIconNormalization() {
    if (visualIconNormalizeQueued) return;
    visualIconNormalizeQueued = true;
    const run = () => {
        visualIconNormalizeQueued = false;
        normalizeVisualIcons(document.body || document);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
    else setTimeout(run, 0);
}

function initVisualIconSystem() {
    normalizeVisualIcons(document);
    if (visualIconObserver || typeof MutationObserver !== 'function' || !document.body) return;
    visualIconObserver = new MutationObserver(scheduleVisualIconNormalization);
    visualIconObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

function getWorkflowLayout(tabId) {
    const section = document.getElementById(`tab-${tabId}`);
    return section?.querySelector?.('.adaptive-workflow') || null;
}

function updateWorkflowInputControls(layout, collapsed) {
    if (!layout) return;
    const title = layout.dataset?.collapsedTitle || '输入区';
    const toggle = layout.querySelector('[data-workflow-toggle]');
    const railTitle = layout.querySelector('[data-workflow-rail-title]');
    const railAction = layout.querySelector('[data-workflow-rail-action]');
    if (toggle) toggle.textContent = collapsed ? '展开输入' : '收起输入';
    if (railTitle) railTitle.textContent = title;
    if (railAction) railAction.textContent = collapsed ? '展开输入区' : '输入区已展开';
}

function updateWorkflowOutputControls(layout) {
    if (!layout) return;
    const title = layout.dataset?.outputTitle || '输出区';
    const ready = layout.classList.contains('result-ready');
    const outputRail = layout.querySelector('[data-workflow-output-rail]');
    const outputTitle = layout.querySelector('[data-workflow-output-title]');
    const outputAction = layout.querySelector('[data-workflow-output-action]');
    if (outputTitle) outputTitle.textContent = title;
    if (outputAction) outputAction.textContent = ready ? '查看输出' : '等待输出';
    if (outputRail) {
        outputRail.disabled = !ready;
        outputRail.setAttribute('aria-disabled', ready ? 'false' : 'true');
    }
}

function setWorkflowInputCollapsed(tabId, collapsed, options = {}) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return false;
    const isCollapsed = Boolean(collapsed);
    layout.classList.toggle('input-collapsed', isCollapsed);
    if (options.manual) {
        workflowPaneState[tabId] = isCollapsed ? 'manual-collapsed' : 'manual-expanded';
    } else if (!workflowPaneState[tabId] || workflowPaneState[tabId].startsWith('auto')) {
        workflowPaneState[tabId] = isCollapsed ? 'auto-collapsed' : 'auto-expanded';
    }
    updateWorkflowInputControls(layout, isCollapsed);
    return true;
}

function setWorkflowOutputCollapsed(tabId, collapsed, options = {}) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return false;
    const isCollapsed = Boolean(collapsed);
    layout.classList.toggle('output-collapsed', isCollapsed);
    if (options.manual) {
        workflowOutputPaneState[tabId] = isCollapsed ? 'manual-collapsed' : 'manual-expanded';
    } else if (!workflowOutputPaneState[tabId] || workflowOutputPaneState[tabId].startsWith('auto')) {
        workflowOutputPaneState[tabId] = isCollapsed ? 'auto-collapsed' : 'auto-expanded';
    }
    updateWorkflowOutputControls(layout);
    return true;
}

function setWorkflowResultEmpty(tabId) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return false;
    workflowPaneState[tabId] = 'auto-expanded';
    workflowOutputPaneState[tabId] = 'auto-collapsed';
    layout.classList.remove('result-ready');
    setWorkflowInputCollapsed(tabId, false);
    setWorkflowOutputCollapsed(tabId, true);
    updateWorkflowOutputControls(layout);
    return true;
}

function setWorkflowResultReady(tabId, ready = true) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return false;
    if (!ready) return setWorkflowResultEmpty(tabId);
    layout.classList.add('result-ready');
    setWorkflowOutputCollapsed(tabId, false);
    updateWorkflowOutputControls(layout);
    return true;
}

function toggleWorkflowInput(tabId) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return false;
    return setWorkflowInputCollapsed(tabId, !layout.classList.contains('input-collapsed'), { manual: true });
}

function autoCollapseWorkflowInput(tabId) {
    setWorkflowResultReady(tabId, true);
    setWorkflowOutputCollapsed(tabId, false);
    if (workflowPaneState[tabId] === 'manual-expanded') return false;
    return setWorkflowInputCollapsed(tabId, true);
}

function syncWorkflowInputState(tabId) {
    const layout = getWorkflowLayout(tabId);
    if (!layout) return;
    const state = workflowPaneState[tabId];
    if (state === 'manual-collapsed' || state === 'auto-collapsed') {
        layout.classList.add('input-collapsed');
        updateWorkflowInputControls(layout, true);
    } else {
        layout.classList.remove('input-collapsed');
        updateWorkflowInputControls(layout, false);
    }
    const outputState = workflowOutputPaneState[tabId];
    if (outputState === 'manual-expanded' || outputState === 'auto-expanded') {
        layout.classList.remove('output-collapsed');
    } else if (outputState === 'manual-collapsed' || outputState === 'auto-collapsed' || !layout.classList.contains('result-ready')) {
        layout.classList.add('output-collapsed');
    }
    updateWorkflowOutputControls(layout);
}

// ==================== Toast提示 ====================
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ==================== Loading + 进度条 ====================
let progressTimer = null;
let progressStartTime = 0;

/**
 * 显示带假进度条的loading
 * @param {string} text - 提示文字
 * @param {number} totalSeconds - 进度条总时长（秒），到时间后卡在99%
 */
function showLoading(text = 'AI正在处理中...', totalSeconds = 60) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.remove('hidden');

    // 重置进度条
    const bar = document.getElementById('progressBar');
    const percentEl = document.getElementById('progressPercent');
    const timeEl = document.getElementById('progressTime');
    bar.style.width = '0%';
    percentEl.textContent = '0%';
    timeEl.textContent = '已用时 0秒';

    progressStartTime = Date.now();

    // 清除旧定时器
    if (progressTimer) clearInterval(progressTimer);

    progressTimer = setInterval(() => {
        const elapsed = (Date.now() - progressStartTime) / 1000;
        const elapsedInt = Math.floor(elapsed);

        // 计算进度：在totalSeconds内线性到99%，之后卡在99%
        let percent;
        if (elapsed >= totalSeconds) {
            percent = 99;
        } else {
            percent = Math.floor((elapsed / totalSeconds) * 99);
        }

        bar.style.width = percent + '%';
        percentEl.textContent = percent + '%';

        // 格式化时间显示
        if (elapsedInt >= 60) {
            const min = Math.floor(elapsedInt / 60);
            const sec = elapsedInt % 60;
            timeEl.textContent = `已用时 ${min}分${sec}秒`;
        } else {
            timeEl.textContent = `已用时 ${elapsedInt}秒`;
        }
    }, 1000);
}

function hideLoading() {
    // 停止进度条
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
    // 直接隐藏（任务完成时进度条消失）
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function loadInstructionFileToTextarea(input, textareaId) {
    const file = input?.files?.[0];
    if (!file) return;

    const name = file.name || '';
    const extOk = /\.(md|txt)$/i.test(name);
    const typeOk = ['text/markdown', 'text/plain', ''].includes(file.type || '');
    if (!extOk || !typeOk) {
        showToast('仅支持上传 md 或 txt 文件', 'warning');
        input.value = '';
        return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
        showToast('指导文件不能超过 2MB', 'warning');
        input.value = '';
        return;
    }

        const target = document.getElementById(textareaId);
        if (!target) {
            showToast('未找到对应的指导输入框', 'error');
            input.value = '';
            return;
        }

    const reader = new FileReader();
    reader.onload = () => {
        const text = String(reader.result || '').trim();
        if (!text) {
            showToast('指导文件内容为空', 'warning');
            input.value = '';
            return;
        }
        const current = readMentionEditorValue(target).trim();
        const block = `【上传指导文件：${name}】\n${text}`;
        writeMentionEditorValue(target, current ? `${current}\n\n${block}` : block);
        target.dispatchEvent(new Event('input', { bubbles: true }));
        updateAdvancedSettingsSummary();
        showToast(`已导入指导文件：${name}`, 'success');
        input.value = '';
    };
    reader.onerror = () => {
        showToast('读取指导文件失败', 'error');
        input.value = '';
    };
    reader.readAsText(file, 'utf-8');
}
window.loadInstructionFileToTextarea = loadInstructionFileToTextarea;

// ==================== 任务下方小进度条（非阻塞） ====================
function startInlineFakeProgress(key, anchorEl, text = '处理中...', totalSeconds = 60) {
    stopInlineFakeProgress(key);
    if (!anchorEl) return;

    const progressId = `inline-progress-${key}`;
    let wrap = document.getElementById(progressId);
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = progressId;
        wrap.className = 'segment-inline-progress generating';
        wrap.style.marginTop = '12px';
        wrap.innerHTML = `
            <div class="segment-progress-info">
                <span id="${progressId}-text"></span>
                <span id="${progressId}-percent">0%</span>
            </div>
            <div class="segment-progress-track">
                <div id="${progressId}-bar" class="segment-progress-bar" style="width:0%"></div>
            </div>`;
        anchorEl.insertAdjacentElement('afterend', wrap);
    }

    const startedAt = Date.now();
    const tick = () => {
        const elapsed = (Date.now() - startedAt) / 1000;
        const elapsedMs = Date.now() - startedAt;
        const percent = Math.min(99, Math.floor((elapsed / totalSeconds) * 99));
        const bar = document.getElementById(`${progressId}-bar`);
        const percentEl = document.getElementById(`${progressId}-percent`);
        const textEl = document.getElementById(`${progressId}-text`);
        if (bar) bar.style.width = `${percent}%`;
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (textEl) textEl.textContent = `${text}，已用时 ${formatElapsedTime(elapsedMs)}`;
    };
    tick();
    inlineProgressTimers.set(key, setInterval(tick, 1000));
}

function startInlineLiveProgress(key, anchorEl, text = '等待模型响应...') {
    stopInlineFakeProgress(key);
    if (!anchorEl) return;

    const progressId = `inline-progress-${key}`;
    let wrap = document.getElementById(progressId);
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = progressId;
        wrap.className = 'segment-inline-progress generating';
        wrap.style.marginTop = '12px';
        wrap.innerHTML = `
            <div class="segment-progress-info">
                <span id="${progressId}-text"></span>
                <span id="${progressId}-percent">0字</span>
            </div>
            <div class="segment-progress-track">
                <div id="${progressId}-bar" class="segment-progress-bar" style="width:8%"></div>
            </div>`;
        anchorEl.insertAdjacentElement('afterend', wrap);
    }
    wrap.dataset.liveText = text;

    const startedAt = Date.now();
    const tick = () => {
        const liveText = wrap?.dataset?.liveText || text;
        const textEl = document.getElementById(`${progressId}-text`);
        if (textEl) textEl.textContent = `${liveText}，已用时 ${formatElapsedTime(Date.now() - startedAt)}`;
    };
    tick();
    inlineProgressTimers.set(key, setInterval(tick, 1000));
}

function updateInlineLiveProgress(key, { stage, text, charCount } = {}) {
    const progressId = `inline-progress-${key}`;
    const wrap = document.getElementById(progressId);
    const bar = document.getElementById(`${progressId}-bar`);
    const percentEl = document.getElementById(`${progressId}-percent`);
    const textEl = document.getElementById(`${progressId}-text`);
    const stagePercent = {
        queued: 12,
        video: 14,
        video_ready: 24,
        roles: 28,
        preparing: 18,
        preparing_stream: 36,
        streaming: 45,
        json_generating: 42,
        json_waiting: 48,
        json_streaming: 58,
        parsing: 78,
        repairing: 82,
        saving: 90,
        storyboard: 94,
        done: 100
    };
    if (bar) {
        const percent = stagePercent[stage] || (charCount ? Math.min(74, 45 + Math.floor(charCount / 500)) : 18);
        bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
    if (percentEl) percentEl.textContent = Number.isFinite(charCount) ? `${charCount}字` : (stage === 'done' ? '完成' : '等待');
    if (text) {
        if (wrap) wrap.dataset.liveText = text;
        if (textEl) textEl.textContent = text;
    }
}

function updateInlineFakeProgress(key, percent, text = '') {
    const progressId = `inline-progress-${key}`;
    const bar = document.getElementById(`${progressId}-bar`);
    const percentEl = document.getElementById(`${progressId}-percent`);
    const textEl = document.getElementById(`${progressId}-text`);
    if (bar && Number.isFinite(percent)) bar.style.width = `${Math.max(0, Math.min(99, percent))}%`;
    if (percentEl && Number.isFinite(percent)) percentEl.textContent = `${Math.max(0, Math.min(99, Math.floor(percent)))}%`;
    if (textEl && text) textEl.textContent = text;
}

function stopInlineFakeProgress(key) {
    const timer = inlineProgressTimers.get(key);
    if (timer) clearInterval(timer);
    inlineProgressTimers.delete(key);
    document.getElementById(`inline-progress-${key}`)?.remove();
}

async function readNdjsonStream(response, handlers = {}) {
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
        const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};
        throw new Error(data.error || `请求失败(${response.status})`);
    }
    if (!response.body) throw new Error('浏览器不支持读取流式响应');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const event = JSON.parse(trimmed);
            if (event.type === 'error') throw new Error(event.error || 'AI处理失败');
            handlers[event.type]?.(event);
        }
    }
    const tail = buffer.trim();
    if (tail) {
        const event = JSON.parse(tail);
        if (event.type === 'error') throw new Error(event.error || 'AI处理失败');
        handlers[event.type]?.(event);
    }
}

function formatActionError(prefix, message) {
    let text = String(message || '操作失败').trim();
    while (text.startsWith(prefix)) {
        text = text.slice(prefix.length).trim();
    }
    return prefix + text;
}

// ==================== 弹窗 ====================
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// ==================== 版本公告 ====================
function renderAnnouncementMarkdown(markdown) {
    const text = markdown || '';
    const lines = text.split(/\r?\n/);
    let html = '';
    let inList = false;

    const closeList = () => {
        if (inList) {
            html += '</ul>';
            inList = false;
        }
    };

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            closeList();
            return;
        }
        if (trimmed.startsWith('# ')) {
            closeList();
            html += `<h2>${escHtml(trimmed.slice(2).trim())}</h2>`;
        } else if (trimmed.startsWith('## ')) {
            closeList();
            html += `<h3>${escHtml(trimmed.slice(3).trim())}</h3>`;
        } else if (/^[-*]\s+/.test(trimmed)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${escHtml(trimmed.replace(/^[-*]\s+/, ''))}</li>`;
        } else {
            closeList();
            html += `<p>${escHtml(trimmed)}</p>`;
        }
    });
    closeList();
    return html || '<p>暂无版本公告。</p>';
}

async function showVersionAnnouncementOnOpen() {
    try {
        const res = await fetch('/api/version-announcement');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '公告加载失败');
        document.getElementById('versionAnnouncementTitle').textContent = `${data.version || '当前版本'} 更新公告`;
        document.getElementById('versionAnnouncementContent').innerHTML = renderAnnouncementMarkdown(data.content || '');
        document.getElementById('versionAnnouncementModal')?.classList.remove('hidden');
    } catch (e) {
        console.warn('加载版本公告失败:', e);
    }
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const placeholder = input.parentElement.querySelector('.upload-placeholder');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==================== 场景管理 ====================
async function loadScenes() {
    try {
        const res = await fetch('/api/scenes');
        scenes = await res.json();
        renderSceneGrid();
        refreshChipSelects();
    } catch (e) {
        console.error('加载场景失败:', e);
    }
}

function renderSceneGrid() {
    const grid = document.getElementById('sceneGrid');
    if (!scenes.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🏞️</div><p>暂无场景，点击上方按钮添加</p></div>`;
        return;
    }
    grid.innerHTML = scenes.map(s => `
        <div class="resource-card">
            <div class="resource-img">
                ${s.image_path ? `<img src="/${s.image_path}" alt="${s.name}">` : '🏞️'}
            </div>
            <div class="resource-info">
                <div class="resource-name">${escHtml(s.name)}</div>
                <div class="resource-desc">${escHtml(s.description || '暂无描述')}</div>
            </div>
            <div class="resource-actions">
                <button class="btn btn-sm btn-secondary" onclick="editScene('${s.id}')">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteScene('${s.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function showSceneModal(editId) {
    document.getElementById('sceneEditId').value = '';
    document.getElementById('sceneName').value = '';
    document.getElementById('sceneDesc').value = '';
    document.getElementById('sceneImage').value = '';
    document.getElementById('scenePreview').classList.add('hidden');
    document.getElementById('sceneUploadPlaceholder').style.display = '';
    document.getElementById('sceneModalTitle').textContent = '添加场景';
    document.getElementById('sceneModal').classList.remove('hidden');
}

function editScene(id) {
    const s = scenes.find(x => x.id === id);
    if (!s) return;
    document.getElementById('sceneEditId').value = s.id;
    document.getElementById('sceneName').value = s.name;
    document.getElementById('sceneDesc').value = s.description || '';
    document.getElementById('sceneModalTitle').textContent = '编辑场景';

    const preview = document.getElementById('scenePreview');
    const placeholder = document.getElementById('sceneUploadPlaceholder');
    if (s.image_path) {
        preview.src = '/' + s.image_path;
        preview.classList.remove('hidden');
        placeholder.style.display = 'none';
    } else {
        preview.classList.add('hidden');
        placeholder.style.display = '';
    }

    document.getElementById('sceneModal').classList.remove('hidden');
}

async function saveScene() {
    const editId = document.getElementById('sceneEditId').value;
    const name = document.getElementById('sceneName').value.trim();
    const desc = document.getElementById('sceneDesc').value.trim();
    const imageFile = document.getElementById('sceneImage').files[0];

    if (!name) { showToast('请输入场景名称', 'warning'); return; }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    if (imageFile) formData.append('image', imageFile);

    try {
        const url = editId ? `/api/scenes/${editId}` : '/api/scenes';
        const method = editId ? 'PUT' : 'POST';
        await fetch(url, { method, body: formData });
        closeModal('sceneModal');
        showToast(editId ? '场景已更新' : '场景已添加', 'success');
        loadScenes();
    } catch (e) {
        showToast('保存失败', 'error');
    }
}

async function deleteScene(id) {
    if (!confirm('确定删除此场景？')) return;
    try {
        await fetch(`/api/scenes/${id}`, { method: 'DELETE' });
        showToast('场景已删除', 'success');
        loadScenes();
    } catch (e) {
        showToast('删除失败', 'error');
    }
}

// ==================== 人物管理 ====================
async function loadCharacters() {
    try {
        const res = await fetch('/api/characters');
        characters = await res.json();
        renderCharGrid();
        refreshChipSelects();
    } catch (e) {
        console.error('加载人物失败:', e);
    }
}

function renderCharGrid() {
    const grid = document.getElementById('charGrid');
    if (!characters.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><p>暂无人物，点击上方按钮添加</p></div>`;
        return;
    }
    grid.innerHTML = characters.map(c => `
        <div class="resource-card">
            <div class="resource-img">
                ${c.image_path ? `<img src="/${c.image_path}" alt="${c.name}">` : '👤'}
            </div>
            <div class="resource-info">
                <div class="resource-name">${escHtml(c.name)}</div>
                <div class="resource-desc">${escHtml(c.description || '暂无描述')}</div>
                ${c.voice_desc ? `<div class="resource-desc" style="margin-top:4px;color:var(--info)">🎙 ${escHtml(c.voice_desc.substring(0, 50))}...</div>` : ''}
            </div>
            <div class="resource-actions">
                <button class="btn btn-sm btn-secondary" onclick="editChar('${c.id}')">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteChar('${c.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function showCharModal() {
    document.getElementById('charEditId').value = '';
    document.getElementById('charName').value = '';
    document.getElementById('charDesc').value = '';
    document.getElementById('charVoice').value = '';
    document.getElementById('charImage').value = '';
    document.getElementById('charPreview').classList.add('hidden');
    document.getElementById('charUploadPlaceholder').style.display = '';
    document.getElementById('charModalTitle').textContent = '添加人物';
    document.getElementById('charModal').classList.remove('hidden');
}

function editChar(id) {
    const c = characters.find(x => x.id === id);
    if (!c) return;
    document.getElementById('charEditId').value = c.id;
    document.getElementById('charName').value = c.name;
    document.getElementById('charDesc').value = c.description || '';
    document.getElementById('charVoice').value = c.voice_desc || '';
    document.getElementById('charModalTitle').textContent = '编辑人物';

    const preview = document.getElementById('charPreview');
    const placeholder = document.getElementById('charUploadPlaceholder');
    if (c.image_path) {
        preview.src = '/' + c.image_path;
        preview.classList.remove('hidden');
        placeholder.style.display = 'none';
    } else {
        preview.classList.add('hidden');
        placeholder.style.display = '';
    }

    document.getElementById('charModal').classList.remove('hidden');
}

async function generateCharVoice() {
    const editId = document.getElementById('charEditId').value;
    const name = document.getElementById('charName').value.trim();
    const desc = document.getElementById('charDesc').value.trim();
    const imageFile = document.getElementById('charImage').files[0];
    const btn = document.getElementById('generateCharVoiceBtn');

    if (!name && !desc && !imageFile && !editId) {
        showToast('请先填写人物名称、人物描述或上传角色参考图', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('character_id', editId);
    formData.append('name', name);
    formData.append('description', desc);
    if (imageFile) formData.append('image', imageFile);

    const oldText = btn ? btn.textContent : '';
    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = '生成中...';
        }
        const res = await fetch('/api/characters/generate-voice', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '生成失败');
        document.getElementById('charVoice').value = data.voice_desc || '';
        showToast('声线已生成并回填', 'success');
    } catch (e) {
        showToast(e.message || '生成声线失败', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = oldText || '✨ 一键生成声线';
        }
    }
}

async function generateCharTurnaround(id) {
    const c = characters.find(x => x.id === id);
    if (!c) return;
    if (!c.description || !c.description.trim()) {
        showToast('请先填写人物描述', 'warning');
        return;
    }

    const btn = document.querySelector(`[onclick="generateCharTurnaround('${id}')"]`);
    const oldText = btn ? btn.textContent : '';
    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = '生成中...';
        }
        showToast('人设三视图生成任务已提交，请稍候', 'info');
        const res = await fetch(`/api/characters/${id}/generate-turnaround`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '生成失败');
        if (data.character) {
            characters = characters.map(item => item.id === id ? data.character : item);
            renderCharGrid();
            refreshChipSelects();
        } else {
            await loadCharacters();
        }
        showToast('人设三视图已生成并设为角色参考图', 'success');
    } catch (e) {
        showToast(e.message || '生成人设三视图失败', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = oldText || '🎨 三视图';
        }
    }
}

async function saveCharacter() {
    const editId = document.getElementById('charEditId').value;
    const name = document.getElementById('charName').value.trim();
    const desc = document.getElementById('charDesc').value.trim();
    const voice = document.getElementById('charVoice').value.trim();
    const imageFile = document.getElementById('charImage').files[0];

    if (!name) { showToast('请输入人物名称', 'warning'); return; }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('voice_desc', voice);
    if (imageFile) formData.append('image', imageFile);

    try {
        const url = editId ? `/api/characters/${editId}` : '/api/characters';
        const method = editId ? 'PUT' : 'POST';
        await fetch(url, { method, body: formData });
        closeModal('charModal');
        showToast(editId ? '人物已更新' : '人物已添加', 'success');
        loadCharacters();
    } catch (e) {
        showToast('保存失败', 'error');
    }
}

async function deleteChar(id) {
    if (!confirm('确定删除此人物？')) return;
    try {
        await fetch(`/api/characters/${id}`, { method: 'DELETE' });
        showToast('人物已删除', 'success');
        loadCharacters();
    } catch (e) {
        showToast('删除失败', 'error');
    }
}

// ==================== 资产库 ====================
async function loadAssets() {
    try {
        const res = await fetch('/api/assets');
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '加载资产库失败', 'error');
            return;
        }
        assetsCache = Array.isArray(data) ? data : [];
        renderAssets();
    } catch (e) {
        showToast('加载资产库失败: ' + e.message, 'error');
    }
}

function getAssetCategoryLabel(category) {
    const labels = {
        scene_image: '场景图',
        character_image: '人设图',
        storyboard_image: '分镜图',
        temp_reference: '临时参考图',
        generated_video: '生成视频',
        merged_video: '合并视频',
        video: '视频'
    };
    return labels[category] || category || '资产';
}

function getAssetCategoryGroup(asset) {
    const category = String(asset?.category || '').toLowerCase();
    const type = String(asset?.asset_type || '').toLowerCase();
    if (type === 'video' || category.includes('video')) return 'video';
    if (category.includes('storyboard')) return 'storyboard';
    if (category.includes('character')) return 'character';
    if (category.includes('scene')) return 'scene';
    return 'reference';
}

function getFilteredAssets() {
    const query = String(assetBrowserState.query || '').trim().toLowerCase();
    const category = assetBrowserState.category || 'all';
    return assetsCache.filter(asset => {
        const group = getAssetCategoryGroup(asset);
        if (category !== 'all' && group !== category) return false;
        if (!query) return true;
        const haystack = [
            asset?.name,
            asset?.file_path,
            asset?.asset_type,
            asset?.category,
            getAssetCategoryLabel(asset?.category)
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });
}

function updateAssetBrowserControls() {
    document.querySelectorAll('[data-asset-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.assetFilter === assetBrowserState.category);
    });
    document.querySelectorAll('[data-asset-density]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.assetDensity === assetBrowserState.density);
    });
    const input = document.getElementById('assetSearchInput');
    if (input && input.value !== assetBrowserState.query) input.value = assetBrowserState.query;
}

function setAssetFilter(category = 'all') {
    assetBrowserState.category = category || 'all';
    updateAssetBrowserControls();
    renderAssets();
}

function setAssetQuery(query = '') {
    assetBrowserState.query = query || '';
    renderAssets();
}

function setAssetDensity(density = 'comfortable') {
    assetBrowserState.density = density === 'compact' ? 'compact' : 'comfortable';
    updateAssetBrowserControls();
    renderAssets();
}

function renderAssets() {
    const grid = document.getElementById('assetGrid');
    if (!grid) return;
    updateAssetBrowserControls();
    const filteredAssets = getFilteredAssets();
    const count = document.getElementById('assetBrowserCount');
    if (count) {
        count.textContent = filteredAssets.length === assetsCache.length
            ? `${assetsCache.length}项`
            : `${filteredAssets.length}/${assetsCache.length} 项`;
    }
    if (grid.dataset) grid.dataset.density = assetBrowserState.density;
    grid.classList?.toggle('compact-grid', assetBrowserState.density === 'compact');
    if (!assetsCache.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🗄️</div><p>暂无资产。生成视频、上传参考图或生成人设图后会自动保存到这里。</p></div>`;
        return;
    }
    if (!filteredAssets.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><p>没有匹配的资产，换个类型或关键词试试。</p></div>`;
        return;
    }
    grid.innerHTML = filteredAssets.map(asset => {
        const isVideo = asset.asset_type === 'video';
        const path = asset.file_path || '';
        const title = asset.name || path.split('/').pop() || '未命名资产';
        const group = getAssetCategoryGroup(asset);
        return `
            <div class="resource-card asset-card" data-asset-category="${escAttr(group)}">
                <div class="resource-img asset-preview">
                    ${isVideo
                        ? `<video src="/${escAttr(path)}" controls preload="none"></video>`
                        : `<img src="/${escAttr(path)}" alt="${escAttr(title)}" onerror="this.parentElement.textContent='📄'">`}
                </div>
                <div class="resource-info">
                    <div class="resource-name">${escHtml(title)}</div>
                    <div class="resource-desc"><span class="resource-kind">${escHtml(getAssetCategoryLabel(asset.category))}</span> · ${escHtml(asset.asset_type || '')}</div>
                    <div class="resource-desc">${escHtml(asset.created_at || '')}</div>
                    <div class="local-path">${escHtml(path)}</div>
                </div>
                <div class="resource-actions">
                    <button class="btn btn-sm btn-secondary" onclick="copyText('${escAttr('/' + path)}')">复制路径</button>
                    <a class="btn btn-sm btn-primary" href="/${escAttr(path)}" target="_blank">打开</a>
                </div>
            </div>`;
    }).join('');
}

// ==================== 素材选择芯片 ====================
function refreshChipSelects() {
    const sceneDiv = document.getElementById('sceneSelect');
    const charDiv = document.getElementById('charSelect');
    const storyboardSceneDiv = document.getElementById('storyboardSceneSelect');
    const storyboardCharDiv = document.getElementById('storyboardCharSelect');
    const videoEditorSceneDiv = document.getElementById('videoEditorSceneSelect');
    const videoEditorCharDiv = document.getElementById('videoEditorCharSelect');

    if (sceneDiv) {
        if (!scenes.length) {
            sceneDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无场景，请先在场景库中添加</span>';
        } else {
            sceneDiv.innerHTML = scenes.map(s => `
                <div class="chip ${selectedScenes.has(s.id) ? 'selected' : ''}" onclick="toggleChip('scene','${s.id}', this)">
                    ${s.image_path ? `<img class="chip-img" src="/${s.image_path}">` : '🏞️'}
                    <span>${escHtml(s.name)}</span>
                </div>
            `).join('');
        }
    }

    if (charDiv) {
        if (!characters.length) {
            charDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无人物，请先在人物库中添加</span>';
        } else {
            charDiv.innerHTML = characters.map(c => `
                <div class="chip ${selectedChars.has(c.id) ? 'selected' : ''}" onclick="toggleChip('char','${c.id}', this)">
                    ${c.image_path ? `<img class="chip-img" src="/${c.image_path}">` : '👤'}
                    <span>${escHtml(c.name)}</span>
                </div>
            `).join('');
        }
    }

    if (storyboardSceneDiv) {
        if (!scenes.length) {
            storyboardSceneDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无场景，请先在场景库中添加</span>';
        } else {
            storyboardSceneDiv.innerHTML = scenes.map(s => `
                <div class="chip ${selectedScenes.has(s.id) ? 'selected' : ''}" onclick="toggleChip('scene','${s.id}', this)">
                    ${s.image_path ? `<img class="chip-img" src="/${s.image_path}">` : '🏞️'}
                    <span>${escHtml(s.name)}</span>
                </div>
            `).join('');
        }
    }

    if (storyboardCharDiv) {
        if (!characters.length) {
            storyboardCharDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无人物，请先在人物库中添加</span>';
        } else {
            storyboardCharDiv.innerHTML = characters.map(c => `
                <div class="chip ${selectedChars.has(c.id) ? 'selected' : ''}" onclick="toggleChip('char','${c.id}', this)">
                    ${c.image_path ? `<img class="chip-img" src="/${c.image_path}">` : '👤'}
                    <span>${escHtml(c.name)}</span>
                </div>
            `).join('');
        }
    }

    if (videoEditorSceneDiv) {
        if (!scenes.length) {
            videoEditorSceneDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无场景，请先在场景库中添加</span>';
        } else {
            videoEditorSceneDiv.innerHTML = scenes.map(s => `
                <div class="chip ${selectedScenes.has(s.id) ? 'selected' : ''}" onclick="toggleChip('scene','${s.id}', this)">
                    ${s.image_path ? `<img class="chip-img" src="/${s.image_path}">` : '🏞️'}
                    <span>${escHtml(s.name)}</span>
                </div>
            `).join('');
        }
    }

    if (videoEditorCharDiv) {
        if (!characters.length) {
            videoEditorCharDiv.innerHTML = '<span style="color:var(--text-muted);font-size:13px">暂无人物，请先在人物库中添加</span>';
        } else {
            videoEditorCharDiv.innerHTML = characters.map(c => `
                <div class="chip ${selectedChars.has(c.id) ? 'selected' : ''}" onclick="toggleChip('char','${c.id}', this)">
                    ${c.image_path ? `<img class="chip-img" src="/${c.image_path}">` : '👤'}
                    <span>${escHtml(c.name)}</span>
                </div>
            `).join('');
        }
    }
    updateVideoEditorReferenceRelation();
}

function toggleChip(type, id, el) {
    const set = type === 'scene' ? selectedScenes : selectedChars;
    if (set.has(id)) {
        set.delete(id);
        el.classList.remove('selected');
    } else {
        set.add(id);
        el.classList.add('selected');
    }
    updateVideoEditorReferenceRelation();
}

function getSelectedIdsInDisplayOrder(type) {
    const items = type === 'scene' ? scenes : characters;
    const selectedSet = type === 'scene' ? selectedScenes : selectedChars;
    const ordered = items.map(item => item.id).filter(id => selectedSet.has(id));
    const remaining = Array.from(selectedSet).filter(id => !ordered.includes(id));
    return ordered.concat(remaining);
}

function parseAssetIdList(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value !== 'string') return [];
    const raw = value.trim();
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch (e) {
        // 兼容逗号分隔的老数据。
    }
    return raw.split(/[,，;；\s]+/).map(s => s.trim()).filter(Boolean);
}

function normalizeAssetMatchText(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
}

function assetNameAliases(type, name) {
    const common = {
        '人群': ['人们', '群众', '路人', '队伍', '排队', '围观', '众人'],
        '青澜市': ['青澜市门口', '城门', '城市门口'],
        '街道': ['街上', '路边', '市街'],
        '集市': ['市场', '摊位', '摊贩'],
        '客栈': ['店里', '店内', '茶桌', '二楼'],
        '野外': ['荒野', '山路', '郊外', '城外']
    };
    const list = common[name] || [];
    return type === 'char' && /军$/.test(name) ? list.concat([`${name}士兵`, '士兵']) : list;
}

function getAssetItems(type) {
    return type === 'scene' ? scenes : characters;
}

function getRelevantAssetIdsForText(type, text, options = {}) {
    const items = getAssetItems(type);
    const selected = getSelectedIdsInDisplayOrder(type);
    const selectedSet = new Set(selected);
    const candidateIds = selected.length ? selected : items.map(item => item.id);
    const candidateSet = new Set(candidateIds);
    const forcedIds = new Set(parseAssetIdList(options.forceIds).filter(id => candidateSet.has(id)));
    const compact = normalizeAssetMatchText(text);
    const matched = [];
    items.forEach(item => {
        if (!candidateSet.has(item.id)) return;
        const name = String(item.name || '').trim();
        const names = [name].concat(assetNameAliases(type, name)).filter(Boolean);
        if (names.some(alias => compact.includes(normalizeAssetMatchText(alias)))) matched.push(item.id);
    });
    const scoped = [];
    candidateIds.forEach(id => {
        if (forcedIds.has(id) || matched.includes(id)) scoped.push(id);
    });
    if (scoped.length) return scoped;
    if (options.fallbackToSelected !== false && selectedSet.size) return selected;
    return [];
}

function getScopedAssetPayload(text, options = {}) {
    const segment = options.segment || {};
    return {
        scenes: getRelevantAssetIdsForText('scene', text, {
            forceIds: segment.scene_id ? [segment.scene_id] : [],
            fallbackToSelected: options.fallbackToSelected
        }),
        characters: getRelevantAssetIdsForText('char', text, {
            forceIds: options.forceSegmentCharacters ? parseAssetIdList(segment.character_ids) : [],
            fallbackToSelected: options.fallbackToSelected
        })
    };
}

function getAssetNamesByIds(type, ids) {
    const itemMap = new Map(getAssetItems(type).map(item => [item.id, item.name]));
    return (ids || []).map(id => itemMap.get(id)).filter(Boolean);
}

function buildAssetScopeInstruction(scope, label = '当前片段') {
    const charNames = getAssetNamesByIds('char', scope.characters);
    const sceneNames = getAssetNamesByIds('scene', scope.scenes);
    return [
        `${label}素材范围：素材库只作为候选，不是必须全部写入最终提示词。`,
        `只写${label}实际出现或被台本明确提到的人物/场景；禁止把未出场人物、未出现地点、整个人物库或整套场景库塞进提示词。`,
        charNames.length ? `可用相关人物：${charNames.join('、')}。只给实际出场人物编号，写成“参考图对应：【图1】角色名，【图2】角色名”。` : '如果当前片段没有明确人物素材，不要编造角色参考图编号。',
        sceneNames.length ? `可用相关场景：${sceneNames.join('、')}。只保留当前片段实际地点和必要连续性锚点。` : '如果当前片段没有明确场景素材，不要列出整套场景库。',
        '最终 Image Prompt 必须是一条自然中文成品提示词：开头直接写“生成单张六格动态分镜表...”，中段用“根据以下剧情转化镜头，不复述台词：...”概括剧情，再写“角色锁：...”“背景锁：...”“01...06...”“负面提示：...”。',
        '禁止输出网页模板标题或旧分块标题：不得出现“固定视觉风格：”“分镜分格要求：”“原始台本依据：”“当前镜头内容：”“逐格镜头要求：”。台词只能转成动作、表情、口型、视线和调度，不能复述台词。'
    ].join('\n');
}

const STORYBOARD_REFERENCE_INDEX_BY_NAME = {
    '时运': 1,
    '温泪': 2,
    '小星': 3,
    '雅琳': 4,
    '尤娜丽': 5,
    '陈小二': 6,
    '飞燕': 7,
    '花鬼': 8,
    '青海君': 9,
    '青海军': 9
};

function getAssetById(type, id) {
    return getAssetItems(type).find(item => item.id === id) || null;
}

function getRelevantCharactersForPrompt(segmentText = '', assetScope = {}) {
    const compact = normalizeAssetMatchText(segmentText);
    const scopedIds = Array.isArray(assetScope.characters) ? assetScope.characters : [];
    const matched = characters.filter(ch => {
        const name = String(ch.name || '').trim();
        if (!name) return false;
        return compact.includes(normalizeAssetMatchText(name));
    });
    const scoped = scopedIds.map(id => getAssetById('char', id)).filter(Boolean);
    const merged = [];
    [...matched, ...scoped].forEach(ch => {
        if (!merged.some(item => item.id === ch.id)) merged.push(ch);
    });
    return merged.filter(ch => normalizeAssetMatchText(segmentText).includes(normalizeAssetMatchText(ch.name || '')));
}

function getRelevantScenesForPrompt(segmentText = '', assetScope = {}) {
    const compact = normalizeAssetMatchText(segmentText);
    const scopedIds = Array.isArray(assetScope.scenes) ? assetScope.scenes : [];
    const matched = scenes.filter(scene => {
        const name = String(scene.name || '').trim();
        if (!name) return false;
        return compact.includes(normalizeAssetMatchText(name));
    });
    const scoped = scopedIds.map(id => getAssetById('scene', id)).filter(Boolean);
    const merged = [];
    [...matched, ...scoped].forEach(scene => {
        if (!merged.some(item => item.id === scene.id)) merged.push(scene);
    });
    return merged;
}

function normalizeStoryboardLine(line = '') {
    return String(line || '')
        .replace(/\t+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^舞台指示\s+情景描述\s*/, '')
        .trim();
}

function extractStoryboardBeats(segmentText = '') {
    return String(segmentText || '')
        .replace(/\r/g, '')
        .split('\n')
        .map(normalizeStoryboardLine)
        .filter(Boolean);
}

function summarizeStoryboardPlot(segmentText = '') {
    const beats = extractStoryboardBeats(segmentText).map(line => {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length >= 2 && parts[0].length <= 8 && !/[。？！!?，、,；;：:]/.test(parts[0])) {
            const speaker = parts[0];
            const action = parts.slice(parts.length >= 3 && parts[1].length <= 8 ? 2 : 1).join('');
            return `${speaker}通过表情、口型和动作表现“${action.replace(/[“”"]/g, '')}”`;
        }
        return line;
    });
    const compact = beats.join('，')
        .replace(/["“”]/g, '')
        .replace(/，+/g, '，')
        .replace(/。+/g, '。')
        .trim();
    return compact.slice(0, 180) || '当前片段里的角色行动和情绪转折';
}

function inferStoryboardScenePhrase(segmentText = '', sceneItems = []) {
    const text = String(segmentText || '');
    const sceneNames = sceneItems.map(item => item.name).filter(Boolean);
    if (/青澜市|城门|排队|文秀|队伍/.test(text)) return '户外城门场景';
    if (/客栈|桌|茶|楼梯|店/.test(text) || sceneNames.includes('客栈')) return '古代客栈室内场景';
    if (/集市|摊|街/.test(text) || sceneNames.includes('集市')) return '古风集市场景';
    if (/街道|路障|屋檐/.test(text) || sceneNames.includes('街道')) return '古风街道场景';
    if (/野外|山|林|荒野|道路/.test(text) || sceneNames.includes('野外')) return '野外行进场景';
    return sceneNames.length ? `${sceneNames[0]}场景` : '当前剧情场景';
}

function buildStoryboardBackgroundLock(segmentText = '', sceneItems = []) {
    const text = String(segmentText || '');
    if (/青澜市|城门|排队|文秀|队伍/.test(text)) {
        return '青澜市城门外，巨大城门、城墙、旗帜、街道、路障、排队人群、车马、远处屋檐与天光固定出现；长队从城门口蜿蜒到前景路边，队伍方向和城门位置保持连续，远处目标人物只作为队伍边缘线索，不抢主角戏';
    }
    if (/客栈|桌|茶|楼梯|店/.test(text)) {
        return '古代客栈室内，圆木桌、凳椅、柜台、楼梯、纸窗、灯笼、木梁和入口保持固定，人物站位、桌面道具和光线方向连续';
    }
    if (/集市|摊|街/.test(text)) {
        return '古风集市街面，摊位、旗幡、人流、石板路、屋檐、货架和远处街口保持连续，前中后景有清楚纵深';
    }
    if (/野外|山|林|荒野|道路/.test(text)) {
        return '野外道路，远山、草坡、树影、岩石、尘土、天空光和行进方向保持连续，角色始终踩在同一条路径轴线上';
    }
    const sceneNames = sceneItems.map(item => item.name).filter(Boolean);
    return sceneNames.length
        ? `${sceneNames.join('、')}，保留当前片段实际地点、固定参照物、光线方向、人物站位、身体朝向、视线目标和连续性锚点`
        : '当前片段实际地点，保留固定参照物、光线方向、人物站位、身体朝向、视线目标和连续性锚点';
}

function buildStoryboardReferenceLine(charItems = []) {
    const mapped = charItems
        .map(ch => {
            const index = STORYBOARD_REFERENCE_INDEX_BY_NAME[ch.name] || null;
            return index ? `【图${index}】${ch.name}` : '';
        })
        .filter(Boolean);
    return mapped.length ? `参考图对应：${mapped.join('，')}。` : '';
}

function buildStoryboardCharacterLock(segmentText = '', charItems = []) {
    if (!charItems.length) return '当前片段出现的人物保持同一脸型、发型、体型、服装轮廓和关键道具，只改变表情、姿态、视线和运动方向';
    return charItems.map(ch => {
        const index = STORYBOARD_REFERENCE_INDEX_BY_NAME[ch.name] || null;
        const prefix = index ? `【图${index}】${ch.name}` : ch.name;
        const desc = (ch.description || '').trim() || '参考图服装、发型、体型和道具保持稳定';
        const performance = new RegExp(`${ch.name}[^\\n。？！!?]*`).exec(segmentText)?.[0] || '';
        return `${prefix}，${desc}${performance ? `，本段表演依据：${normalizeStoryboardLine(performance)}` : ''}`;
    }).join('；');
}

function buildLocalStoryboardPanels(segmentText = '', scenePhrase = '') {
    const beats = extractStoryboardBeats(segmentText);
    const b1 = beats[0] || '环境和人物关系建立';
    const b2 = beats[1] || b1;
    const b3 = beats[2] || b2;
    const summary = summarizeStoryboardPlot(segmentText);
    return [
        `01，超广角高机位建立镜头，先交代${scenePhrase}的空间全貌和人物初始站位，前景用环境物件切入，中景放当前片段主角，背景保留地点锚点；红色箭头标人群或角色移动，蓝色箭头俯冲推向剧情触发点，绿色线标纵深关系`,
        `02，低机位近景从前景遮挡旁穿过，表现${normalizeStoryboardLine(b1)}带来的第一反应，人物身体重心发生变化，背景锚点保持同一方向；紫色标注情绪压力，蓝色镜头横移`,
        `03，越肩中近景把视线引向${normalizeStoryboardLine(b2)}，角色之间形成三角站位，不横向排队，前景保留局部身体或道具裁切；红色箭头标视线和手部动作，绿色标关系轴`,
        `04，视觉转折特写，抓住${normalizeStoryboardLine(b3)}里的关键道具、手势、眼神或口型瞬间，不出现可读台词文字，背景虚化但保留地点线索；橙色侧光突出焦点，紫色强调剧情转折`,
        `05，中近景反应镜头，把${summary}压缩成可见表演，角色表情克制，站位与上一格错开，前景遮挡制造纵深；红色标动作轨迹，蓝色轻微侧滑，绿色标构图重心`,
        `06，收束中远景，角色朝下一步行动目标或情绪落点移动，${scenePhrase}锚点继续可见，形成从当前片段到下一片段的连续方向；蓝色箭头推向目标，红色箭头标指向或转身，紫色标轻微情绪高点`
    ].join('。');
}

function buildLocalStoryboardPrompt(index, segmentText = '', assetScope = {}) {
    const charItems = getRelevantCharactersForPrompt(segmentText, assetScope);
    const sceneItems = getRelevantScenesForPrompt(segmentText, assetScope);
    const scenePhrase = inferStoryboardScenePhrase(segmentText, sceneItems);
    const referenceLine = buildStoryboardReferenceLine(charItems);
    const plotSummary = summarizeStoryboardPlot(segmentText);
    const roleLock = buildStoryboardCharacterLock(segmentText, charItems);
    const backgroundLock = buildStoryboardBackgroundLock(segmentText, sceneItems);
    const panels = buildLocalStoryboardPanels(segmentText, scenePhrase);
    return `${referenceLine}生成单张六格动态分镜表，${scenePhrase}，21:9，三乘二清晰分格，每格内部按16:9构图，角落仅保留极小黑色编号01-06；偏古风3D动画预演分镜，干净高调黑白灰阶，明亮灰白底，单色石墨线稿叠加柔和体积明暗，环境细节密集但画面干净，角色有立体体积感和可读剪影，半写实古风比例，自然五官，克制表情，不要大眼萌系或幼态卡通脸，电影感构图，前景遮挡，倾斜透视，动态调度，可见镜头路径箭头、身体重心线、情绪冲击线。根据以下剧情转化镜头，不复述台词：${plotSummary}。角色锁：${roleLock}。背景锁：${backgroundLock}。${panels}。负面提示：不要静态合照、横向排队式主角站位、平视中景连用、居中全身展示、无分格插画、重复机位、空背景、人物漂浮、平面舞台式站位；不要真实照片、网页截图、软件界面、现代室内照片、商品图、UI图标、手机界面或外部素材混入画面；不要彩色动漫、漫画封面、油画、水彩、厚涂、照片级渲染、彩色3D成片；不要脏灰雾、黑雾遮罩、大面积灰蒙覆盖、过曝死白、死黑、低对比糊成一片；不要Q版、大眼萌、幼态圆脸、夸张卡通表情；不要对白框、字幕、对白内容、长说明、水印、标志、界面元素；不要改变角色脸型、发型、服装、体型和年龄；避免手部畸形、多指、重复脸、比例不一致、背景漂移、空间断裂；不要重复同高度同方向同焦段，不要让主角排成水平线，不要每格都正面完整居中。`;
}

// ==================== 提示词库 ====================
async function loadPromptLibrary() {
    try {
        const res = await fetch('/api/prompt-library');
        promptLibrary = await res.json();
        renderPromptLibraryGrid();
        refreshPromptMentionBadges();
    } catch (e) {
        console.error('加载提示词库失败:', e);
    }
}

function renderPromptLibraryGrid() {
    const grid = document.getElementById('promptLibraryGrid');
    const count = document.getElementById('promptLibraryCount');
    updatePromptLibraryControls();
    const filteredItems = getFilteredPromptLibrary();
    if (count) {
        count.textContent = filteredItems.length === promptLibrary.length
            ? `${promptLibrary.length || 0}条`
            : `${filteredItems.length}/${promptLibrary.length || 0}条`;
    }
    if (!grid) return;
    if (grid.dataset) grid.dataset.density = promptLibraryState.density;
    grid.classList?.toggle('compact-grid', promptLibraryState.density === 'compact');
    if (!promptLibrary.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>暂无提示词，点击上方按钮新建</p></div>';
        return;
    }
    if (!filteredItems.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div><p>没有匹配的提示词。</p></div>';
        return;
    }
    grid.innerHTML = filteredItems.map(item => `
        <div class="prompt-library-card">
            ${item.image_path ? `<div class="prompt-library-image"><img src="/${escAttr(item.image_path)}" alt="${escAttr(item.title)}"></div>` : ''}
            <div class="prompt-library-card-body">
                <div class="prompt-library-card-title">
                    <span>@${escHtml(item.title)}</span>
                    ${item.is_default ? '<span class="badge">默认</span>' : ''}
                </div>
                <div class="prompt-library-card-content">${escHtml(item.content || '')}</div>
            </div>
            <div class="resource-actions compact-actions">
                <button class="btn btn-sm btn-secondary" onclick="insertPromptMention('${escAttr(item.title)}')">插入额外要求</button>
                <details class="inline-more-menu">
                    <summary>更多</summary>
                    <div>
                        <button class="btn btn-sm btn-secondary" onclick="editPromptLibraryItem('${escAttr(item.id)}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePromptLibraryItem('${escAttr(item.id)}')">删除</button>
                    </div>
                </details>
            </div>
        </div>
    `).join('');
}

function getFilteredPromptLibrary() {
    const query = String(promptLibraryState.query || '').trim().toLowerCase();
    if (!query) return promptLibrary;
    return promptLibrary.filter(item => {
        const haystack = [
            item?.title,
            item?.content,
            item?.image_path,
            item?.is_default ? '默认' : ''
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });
}

function updatePromptLibraryControls() {
    document.querySelectorAll('[data-prompt-density]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.promptDensity === promptLibraryState.density);
    });
    const input = document.getElementById('promptLibrarySearchInput');
    if (input && input.value !== promptLibraryState.query) input.value = promptLibraryState.query;
}

function setPromptLibraryQuery(query = '') {
    promptLibraryState.query = query || '';
    renderPromptLibraryGrid();
}

function setPromptLibraryDensity(density = 'comfortable') {
    promptLibraryState.density = density === 'compact' ? 'compact' : 'comfortable';
    updatePromptLibraryControls();
    renderPromptLibraryGrid();
}

function showPromptLibraryModal() {
    document.getElementById('promptLibraryEditId').value = '';
    document.getElementById('promptLibraryTitle').value = '';
    document.getElementById('promptLibraryContent').value = '';
    document.getElementById('promptLibraryImage').value = '';
    document.getElementById('promptLibraryPreview').classList.add('hidden');
    document.getElementById('promptLibraryUploadPlaceholder').style.display = '';
    document.getElementById('promptLibraryClearImage').checked = false;
    document.getElementById('promptLibraryClearImageRow').classList.add('hidden');
    document.getElementById('promptLibraryModalTitle').textContent = '新建提示词';
    document.getElementById('promptLibraryModal').classList.remove('hidden');
}

function editPromptLibraryItem(id) {
    const item = promptLibrary.find(x => x.id === id);
    if (!item) return;
    document.getElementById('promptLibraryEditId').value = item.id;
    document.getElementById('promptLibraryTitle').value = item.title || '';
    document.getElementById('promptLibraryContent').value = item.content || '';
    document.getElementById('promptLibraryImage').value = '';
    document.getElementById('promptLibraryClearImage').checked = false;
    document.getElementById('promptLibraryClearImageRow').classList.toggle('hidden', !item.image_path);
    document.getElementById('promptLibraryModalTitle').textContent = '编辑提示词';

    const preview = document.getElementById('promptLibraryPreview');
    const placeholder = document.getElementById('promptLibraryUploadPlaceholder');
    if (item.image_path) {
        preview.src = '/' + item.image_path;
        preview.classList.remove('hidden');
        placeholder.style.display = 'none';
    } else {
        preview.classList.add('hidden');
        placeholder.style.display = '';
    }
    document.getElementById('promptLibraryModal').classList.remove('hidden');
}

async function savePromptLibraryItem() {
    const editId = document.getElementById('promptLibraryEditId').value;
    const title = document.getElementById('promptLibraryTitle').value.trim();
    const content = document.getElementById('promptLibraryContent').value.trim();
    const imageFile = document.getElementById('promptLibraryImage').files[0];
    const clearImage = document.getElementById('promptLibraryClearImage').checked;
    if (!title) { showToast('请输入提示词标题', 'warning'); return; }
    if (!content) { showToast('请输入提示词内容', 'warning'); return; }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);
    if (clearImage) formData.append('clear_image', '1');

    try {
        const res = await fetch(editId ? `/api/prompt-library/${editId}` : '/api/prompt-library', {
            method: editId ? 'PUT' : 'POST',
            body: formData
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data.error || '保存提示词失败', 'error');
            return;
        }
        closeModal('promptLibraryModal');
        showToast(editId ? '提示词已更新' : '提示词已创建', 'success');
        await loadPromptLibrary();
    } catch (e) {
        showToast('保存提示词失败: ' + e.message, 'error');
    }
}

async function deletePromptLibraryItem(id) {
    if (!confirm('确定删除这个提示词？已经写在文本里的 @标题 不会自动移除。')) return;
    try {
        const res = await fetch(`/api/prompt-library/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data.error || '删除提示词失败', 'error');
            return;
        }
        showToast('提示词已删除', 'success');
        await loadPromptLibrary();
    } catch (e) {
        showToast('删除提示词失败: ' + e.message, 'error');
    }
}

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PROMPT_MENTION_END_SOURCE = `(?=$|[\\s,.;:!?，。；：！？、）)\\]】}」』"'》])`;

function getPromptMentionMatches(text) {
    const source = String(text || '');
    if (!source.includes('@') || !promptLibrary.length) return [];
    const matches = [];
    const seen = new Set();
    const sorted = [...promptLibrary].sort((a, b) => String(b.title || '').length - String(a.title || '').length);
    sorted.forEach(item => {
        const title = String(item.title || '').trim();
        if (!title || seen.has(title)) return;
        const pattern = new RegExp(`@${escapeRegExp(title)}${PROMPT_MENTION_END_SOURCE}`, 'i');
        if (pattern.test(source)) {
            matches.push(item);
            seen.add(title);
        }
    });
    return matches;
}

function renderPromptMentionBadges(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const matches = getPromptMentionMatches(text);
    container.innerHTML = matches.map(item => `
        <span class="prompt-mention-chip" tabindex="0">
            @${escHtml(item.title)}
            <span class="prompt-mention-popover">
                ${item.image_path ? `<img src="/${escAttr(item.image_path)}" alt="${escAttr(item.title)}">` : ''}
                <strong>@${escHtml(item.title)}</strong>
                <span>${escHtml(item.content || '')}</span>
            </span>
        </span>
    `).join('');
}

function refreshPromptMentionBadges() {
    renderPromptMentionBadges('scriptPromptMentions', document.getElementById('scriptInput')?.value || '');
    renderPromptMentionBadges('instructionPromptMentions', document.getElementById('scriptProcessInstruction')?.value || '');
}

function initPromptMentionInputs() {
    ['scriptInput', 'scriptProcessInstruction'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            refreshPromptMentionBadges();
            updatePromptMentionSuggestions(el);
            if (id === 'scriptInput') updateProductionTopBanner();
        });
        el.addEventListener('change', () => {
            refreshPromptMentionBadges();
            if (id === 'scriptInput') updateProductionTopBanner();
        });
        el.addEventListener('click', () => updatePromptMentionSuggestions(el));
        el.addEventListener('keyup', (evt) => {
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(evt.key)) return;
            updatePromptMentionSuggestions(el);
        });
        el.addEventListener('keydown', handlePromptMentionSuggestionKeydown);
        el.addEventListener('blur', () => {
            setTimeout(() => {
                if (promptMentionSuggestState.target === el) hidePromptMentionSuggestions();
            }, 160);
        });
    });
    document.addEventListener('mousedown', (evt) => {
        const layer = document.getElementById('promptMentionSuggest');
        if (!layer || layer.classList.contains('hidden')) return;
        if (layer.contains(evt.target)) return;
        if (promptMentionSuggestState.target && promptMentionSuggestState.target.contains(evt.target)) return;
        hidePromptMentionSuggestions();
    });
}

function insertPromptMention(title) {
    const target = document.getElementById('scriptProcessInstruction') || document.getElementById('scriptInput');
    if (!target) return;
    const mention = `@${title}`;
    const current = target.value.trim();
    if (current.includes(mention)) {
        showToast(`${mention} 已在额外要求中`, 'info');
        switchToTab('script');
        return;
    }
    target.value = current ? `${current}\n${mention}` : mention;
    target.dispatchEvent(new Event('input', { bubbles: true }));
    switchToTab('script');
    showToast(`已插入 ${mention}`, 'success');
}

function getPromptMentionTrigger(textarea) {
    if (!textarea || typeof textarea.selectionStart !== 'number') return null;
    const cursor = textarea.selectionStart;
    if (textarea.selectionEnd !== cursor) return null;
    const before = textarea.value.slice(0, cursor);
    const atIndex = before.lastIndexOf('@');
    if (atIndex < 0) return null;
    const prev = atIndex > 0 ? before[atIndex - 1] : '';
    if (prev && !/[\s，。；：！？、（(【\[「『"']/.test(prev)) return null;
    const query = before.slice(atIndex + 1);
    if (/[\s，。；：！？、）)\]】」』"'<>《》]/.test(query)) return null;
    return { start: atIndex, end: cursor, query };
}

function getPromptMentionSuggestionItems(query) {
    const keyword = String(query || '').trim().toLowerCase();
    const items = [...promptLibrary].sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN'));
    if (!keyword) return items.slice(0, 10);
    return items.filter(item => {
        const title = String(item.title || '').toLowerCase();
        const content = String(item.content || '').toLowerCase();
        return title.includes(keyword) || content.includes(keyword);
    }).slice(0, 10);
}

function ensurePromptMentionSuggestLayer() {
    let layer = document.getElementById('promptMentionSuggest');
    if (layer) return layer;
    layer = document.createElement('div');
    layer.id = 'promptMentionSuggest';
    layer.className = 'prompt-mention-suggest hidden';
    document.body.appendChild(layer);
    return layer;
}

function updatePromptMentionSuggestions(textarea) {
    const layer = ensurePromptMentionSuggestLayer();
    const trigger = getPromptMentionTrigger(textarea);
    if (!trigger || !promptLibrary.length) {
        hidePromptMentionSuggestions();
        return;
    }
    const items = getPromptMentionSuggestionItems(trigger.query);
    if (!items.length) {
        layer.innerHTML = `
            <div class="prompt-mention-suggest-empty">未找到匹配的提示词</div>
        `;
    } else {
        layer.innerHTML = items.map((item, index) => `
            <button type="button" class="prompt-mention-suggest-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <span class="prompt-mention-suggest-title">@${escHtml(item.title)}</span>
                <span class="prompt-mention-suggest-content">${escHtml(item.content || '')}</span>
            </button>
        `).join('');
    }
    promptMentionSuggestState = {
        target: textarea,
        start: trigger.start,
        end: trigger.end,
        query: trigger.query,
        items,
        activeIndex: 0
    };
    layer.querySelectorAll('.prompt-mention-suggest-item').forEach(btn => {
        btn.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            const index = Number(btn.dataset.index || 0);
            applyPromptMentionSuggestion(index);
        });
    });
    positionPromptMentionSuggestLayer(textarea, layer);
    layer.classList.remove('hidden');
}

function positionPromptMentionSuggestLayer(textarea, layer) {
    const rect = textarea.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width * 0.72, 280), 460);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > 240 ? rect.bottom + 8 : Math.max(12, rect.top + 8);
    const left = Math.min(Math.max(12, rect.left + 12), window.innerWidth - width - 12);
    layer.style.width = `${width}px`;
    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
}

function hidePromptMentionSuggestions() {
    const layer = document.getElementById('promptMentionSuggest');
    if (layer) layer.classList.add('hidden');
    promptMentionSuggestState.target = null;
    promptMentionSuggestState.items = [];
    promptMentionSuggestState.activeIndex = 0;
}

function setPromptMentionSuggestionActive(index) {
    const layer = document.getElementById('promptMentionSuggest');
    const items = promptMentionSuggestState.items || [];
    if (!layer || !items.length) return;
    const next = (index + items.length) % items.length;
    promptMentionSuggestState.activeIndex = next;
    layer.querySelectorAll('.prompt-mention-suggest-item').forEach((btn, i) => {
        btn.classList.toggle('active', i === next);
        if (i === next) btn.scrollIntoView({ block: 'nearest' });
    });
}

function applyPromptMentionSuggestion(index = promptMentionSuggestState.activeIndex) {
    const textarea = promptMentionSuggestState.target;
    const item = promptMentionSuggestState.items?.[index];
    if (!textarea || !item) return;
    const value = textarea.value || '';
    const before = value.slice(0, promptMentionSuggestState.start);
    const after = value.slice(promptMentionSuggestState.end);
    const mention = `@${item.title}`;
    const needsSpace = after && !/^[\s，。；：！？、）)\]】」』"'<>《》]/.test(after);
    textarea.value = `${before}${mention}${needsSpace ? ' ' : ''}${after}`;
    const cursor = before.length + mention.length + (needsSpace ? 1 : 0);
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    hidePromptMentionSuggestions();
}

function handlePromptMentionSuggestionKeydown(evt) {
    const layer = document.getElementById('promptMentionSuggest');
    if (!layer || layer.classList.contains('hidden') || promptMentionSuggestState.target !== evt.currentTarget) return;
    if (evt.key === 'Escape') {
        evt.preventDefault();
        hidePromptMentionSuggestions();
        return;
    }
    if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        setPromptMentionSuggestionActive(promptMentionSuggestState.activeIndex + 1);
        return;
    }
    if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        setPromptMentionSuggestionActive(promptMentionSuggestState.activeIndex - 1);
        return;
    }
    if ((evt.key === 'Enter' || evt.key === 'Tab') && promptMentionSuggestState.items.length) {
        evt.preventDefault();
        applyPromptMentionSuggestion();
    }
}

// ==================== 模式管理 ====================
async function loadDirectorModes() {
    try {
        const headers = directorModePassword ? { 'X-Director-Mode-Password': directorModePassword } : {};
        const res = await fetch('/api/director-modes', { headers });
        if (!res.ok) {
            throw new Error('加载视频模式失败');
        }
        const data = await res.json();
        directorModes = Array.isArray(data) ? data : [];
        directorModeUnlocked = directorModes.some(mode => !mode.prompt_locked);
        if (!directorModeUnlocked && directorModePassword) {
            sessionStorage.removeItem('directorModePassword');
            directorModePassword = '';
        }
        renderDirectorModeSelect();
        renderDirectorModeGrid();
        return true;
    } catch (e) {
        console.error('加载视频模式失败:', e);
        return false;
    }
}

async function unlockDirectorModes() {
    const password = prompt('请输入编导模式管理密码');
    if (password === null) return false;
    if (password !== 'YX6688') {
        showToast('密码错误，无法查看或编辑编导模式提示词', 'error');
        return false;
    }
    directorModePassword = password;
    sessionStorage.setItem('directorModePassword', password);
    const loaded = await loadDirectorModes();
    if (!loaded || !directorModeUnlocked) {
        sessionStorage.removeItem('directorModePassword');
        directorModePassword = '';
        showToast('解锁失败，请稍后重试', 'error');
        return false;
    }
    showToast('编导模式已解锁，可查看和编辑提示词', 'success');
    return true;
}

async function requireDirectorModeUnlock() {
    if (directorModeUnlocked) return true;
    return await unlockDirectorModes();
}

function renderDirectorModeSelect() {
    const select = document.getElementById('directorModeSelect');
    if (!select) return;
    const current = select.value;
    if (!directorModes.length) {
        select.innerHTML = '<option value="">暂无视频模式</option>';
        updateAdvancedSettingsSummary();
        return;
    }
    select.innerHTML = directorModes.map(mode => `
        <option value="${escAttr(mode.id)}" ${(current ? current === mode.id : mode.is_default) ? 'selected' : ''}>
            ${escHtml(mode.name)}${mode.is_default ? '（默认）' : ''}
        </option>
    `).join('');
    updateAdvancedSettingsSummary();
}

function renderDirectorModeGrid() {
    const grid = document.getElementById('directorModeGrid');
    if (!grid) return;
    if (!directorModes.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎬</div><p>暂无视频模式，点击上方按钮新建</p></div>';
        return;
    }
    grid.innerHTML = directorModes.map(mode => `
        <div class="director-mode-card ${mode.prompt_locked ? 'locked' : ''}">
            <div class="director-mode-header">
                <div>
                    <div class="director-mode-name">${escHtml(mode.name)}</div>
                    <div class="director-mode-key">${escHtml(mode.mode_key || 'custom')}</div>
                </div>
                ${mode.is_default ? '<span class="badge">默认</span>' : ''}
            </div>
            <div class="director-mode-prompt">${escHtml(mode.prompt || '')}</div>
            <div class="resource-actions">
                <button class="btn btn-sm btn-secondary" onclick="editDirectorMode('${mode.id}')">${mode.prompt_locked ? '输入密码编辑' : '编辑/改名'}</button>
                ${mode.is_default ? '' : `<button class="btn btn-sm btn-secondary" onclick="setDefaultDirectorMode('${mode.id}')">设为默认</button>`}
                <button class="btn btn-sm btn-danger" onclick="deleteDirectorMode('${mode.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

async function showDirectorModeModal() {
    if (!(await requireDirectorModeUnlock())) return;
    document.getElementById('directorModeEditId').value = '';
    document.getElementById('directorModeName').value = '';
    document.getElementById('directorModeKey').value = '';
    document.getElementById('directorModePrompt').value = '';
    document.getElementById('directorModeDefault').checked = false;
    document.getElementById('directorModeModalTitle').textContent = '新建视频模式';
    document.getElementById('directorModeModal').classList.remove('hidden');
}

async function editDirectorMode(id) {
    if (!(await requireDirectorModeUnlock())) return;
    const mode = directorModes.find(x => x.id === id);
    if (!mode) return;
    document.getElementById('directorModeEditId').value = mode.id;
    document.getElementById('directorModeName').value = mode.name || '';
    document.getElementById('directorModeKey').value = mode.mode_key || '';
    document.getElementById('directorModePrompt').value = mode.prompt || '';
    document.getElementById('directorModeDefault').checked = !!mode.is_default;
    document.getElementById('directorModeModalTitle').textContent = '编辑视频模式';
    document.getElementById('directorModeModal').classList.remove('hidden');
}

async function saveDirectorMode() {
    const editId = document.getElementById('directorModeEditId').value;
    const name = document.getElementById('directorModeName').value.trim();
    const modeKey = document.getElementById('directorModeKey').value.trim();
    const prompt = document.getElementById('directorModePrompt').value.trim();
    const isDefault = document.getElementById('directorModeDefault').checked;
    if (!name) { showToast('请输入视频模式名称', 'warning'); return; }
    if (!prompt) { showToast('请输入视频模式提示词', 'warning'); return; }

    try {
        const res = await fetch(editId ? `/api/director-modes/${editId}` : '/api/director-modes', {
            method: editId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Director-Mode-Password': directorModePassword },
            body: JSON.stringify({ name, mode_key: modeKey, prompt, is_default: isDefault })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '保存失败', 'error');
            return;
        }
        closeModal('directorModeModal');
        showToast(editId ? '视频模式已更新' : '视频模式已创建', 'success');
        await loadDirectorModes();
        const select = document.getElementById('directorModeSelect');
        if (select && data.id) select.value = data.id;
        updateAdvancedSettingsSummary();
    } catch (e) {
        showToast('保存失败: ' + e.message, 'error');
    }
}

async function setDefaultDirectorMode(id) {
    if (!(await requireDirectorModeUnlock())) return;
    const mode = directorModes.find(x => x.id === id);
    if (!mode) return;
    try {
        const res = await fetch(`/api/director-modes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Director-Mode-Password': directorModePassword },
            body: JSON.stringify({ name: mode.name, mode_key: mode.mode_key, prompt: mode.prompt, is_default: true })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '设置默认失败', 'error');
            return;
        }
        showToast('已设为默认视频模式', 'success');
        loadDirectorModes();
    } catch (e) {
        showToast('设置默认失败: ' + e.message, 'error');
    }
}

async function deleteDirectorMode(id) {
    if (!(await requireDirectorModeUnlock())) return;
    if (!confirm('确定删除此视频模式？')) return;
    try {
        const res = await fetch(`/api/director-modes/${id}`, {
            method: 'DELETE',
            headers: { 'X-Director-Mode-Password': directorModePassword }
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '删除失败', 'error');
            return;
        }
        showToast('视频模式已删除', 'success');
        loadDirectorModes();
    } catch (e) {
        showToast('删除失败: ' + e.message, 'error');
    }
}

// ==================== 剧本处理 ====================
let storyboardConfirmed = false;

function initStoryboardPromptToggle() {
    const toggle = document.getElementById('storyboardModeToggle');
    if (localStorage.getItem(STORYBOARD_PROMPTS_STORAGE_KEY) === null) {
        localStorage.setItem(STORYBOARD_PROMPTS_STORAGE_KEY, '1');
    }
    if (toggle) toggle.checked = localStorage.getItem(STORYBOARD_PROMPTS_STORAGE_KEY) !== '0';
    syncStoryboardPromptToggle();
}

function initAdvancedGenerationSettings() {
    const instruction = document.getElementById('scriptProcessInstruction');
    const modeSelect = document.getElementById('directorModeSelect');
    if (instruction) instruction.addEventListener('input', updateAdvancedSettingsSummary);
    if (modeSelect) modeSelect.addEventListener('change', updateAdvancedSettingsSummary);
    updateAdvancedSettingsSummary();
}

function updateAdvancedSettingsSummary() {
    const instructionValue = readMentionEditorValue(document.getElementById('scriptProcessInstruction')).trim();
    const modeSelect = document.getElementById('directorModeSelect');
    const modeText = modeSelect?.selectedOptions?.[0]?.textContent?.trim() || '默认';
    const storyboardEnabled = isStoryboardModeEnabled();

    const instructionSummary = document.getElementById('advancedInstructionSummary');
    const modeSummary = document.getElementById('advancedModeSummary');
    const storyboardSummary = document.getElementById('advancedStoryboardSummary');
    const storyboardText = document.getElementById('storyboardToggleText');
    const storyboardHint = document.getElementById('storyboardToggleHint');
    const storyboardShortcut = document.getElementById('storyboardEnableShortcut');

    if (instructionSummary) instructionSummary.textContent = instructionValue ? '额外要求：已填写' : '额外要求：无';
    if (modeSummary) modeSummary.textContent = `模式：${modeText}`;
    if (storyboardSummary) storyboardSummary.textContent = storyboardEnabled ? '分镜驱动：主线启用' : '分镜驱动：兼容旧流程';
    if (storyboardText) storyboardText.textContent = storyboardEnabled ? '主线启用' : '旧流程';
    if (storyboardHint) {
        storyboardHint.textContent = storyboardEnabled
            ? '主线会自动按台词估时规则切成15秒以内段落，并逐段生成 Image Prompt；分镜图和视频需要用户检查 Prompt 后手动生成。'
            : '当前为兼容旧流程：直接生成常规视频台本，不强制分镜图驱动。';
    }
    if (storyboardShortcut) storyboardShortcut.classList.toggle('hidden', storyboardEnabled);
}

function isStoryboardModeEnabled() {
    const toggle = document.getElementById('storyboardModeToggle');
    if (toggle) return !!toggle.checked;
    return localStorage.getItem(STORYBOARD_PROMPTS_STORAGE_KEY) !== '0';
}

function syncStoryboardPromptToggle() {
    const enabled = isStoryboardModeEnabled();
    const btn = document.getElementById('storyboardPromptToggleBtn');
    const generateBtn = document.getElementById('generateAllStoryboardPromptsBtn');
    const status = document.getElementById('storyboardPromptToggleStatus');
    if (btn) {
        btn.classList.toggle('btn-primary', !enabled);
        btn.classList.toggle('btn-secondary', enabled);
        btn.textContent = enabled ? '兼容旧流程' : '启用分镜驱动';
    }
    if (generateBtn) generateBtn.classList.toggle('hidden', !enabled);
    if (status) status.textContent = enabled ? '分镜驱动已启用' : '兼容旧流程';
    updateAdvancedSettingsSummary();
}

function setStoryboardPromptsEnabled(enabled, options = {}) {
    const toggle = document.getElementById('storyboardModeToggle');
    if (toggle) toggle.checked = !!enabled;
    localStorage.setItem(STORYBOARD_PROMPTS_STORAGE_KEY, enabled ? '1' : '0');
    syncStoryboardPromptToggle();
    if (currentSegments.length) renderSegments(currentSegments);
    if (options.silent) return;
    showToast(
        enabled
            ? '已启用主线分镜驱动：会自动生成 Image Prompt，分镜图和视频由用户确认后手动生成'
            : '已切换为兼容旧流程：保留原有直接视频台本路径',
        'success'
    );
}

function toggleStoryboardPromptsEnabled() {
    const enabled = !isStoryboardModeEnabled();
    setStoryboardPromptsEnabled(enabled);
}

function getStoryboardRatio() {
    return document.getElementById('storyboardPageRatioSelect')?.value || document.getElementById('storyboardRatioSelect')?.value || '16:9';
}

function getBreakdownText() {
    return document.getElementById('breakdownResultText')?.value?.trim() || '';
}

function syncCurrentScriptToBreakdown() {
    const input = document.getElementById('breakdownInput');
    if (!input || input.value.trim()) return;
    const scriptText = document.getElementById('scriptInput')?.value?.trim() || document.getElementById('storyboardScriptInput')?.value?.trim() || currentProjectInfo?.script_text || '';
    if (scriptText) input.value = scriptText;
}

function setButtonBusy(btn, busyText) {
    if (!btn) return () => {};
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = busyText;
    return () => {
        btn.disabled = false;
        btn.innerHTML = oldText;
    };
}

function getFriendlyGenerationError(errorText, fallback = '生成失败') {
    const text = String(errorText || '').trim();
    if (/Failed to fetch|Load failed|NetworkError|无法连接|ERR_CONNECTION|connection refused/i.test(text)) {
        return '后台服务未连接：请重新打开工具，或刷新页面后再点生成。';
    }
    if (/413|Request Entity Too Large/i.test(text)) {
        return '请求内容过大：请减少参考图数量、压缩图片，或生成更简短的 Image Prompt 后重试。';
    }
    if (/<html|<body|<head|<\/html/i.test(text)) {
        return '服务返回了网页错误，请减少本次提交内容后重试。';
    }
    return text || fallback;
}

function buildMainlineImagePromptInstruction(extraInstruction = '') {
    const mainline = [
        '主线流程第一步只做原台词分段：只按照下面的分段 rule，把原始台本切成多个15秒以内段落。',
        '按照分配时长前，内部先估算：台词秒数 = round(有效字符数 * 每字基础秒数 * 语速系数 + 停顿补偿秒数)。',
        '默认值：每字基础秒数 0.22；默认语速系数 0.85；快速/急促语速 0.70-0.80；自然/普通语速 0.85-1.00；缓慢/迟疑/沉重语速 1.10-1.30；短逗号/轻微停顿约 0.2 秒；句号/问号/叹号/明显换气约 0.4 秒；省略号/沉默/情绪停顿约 0.6-1.0 秒。',
        '只计算引号内实际发声的中文字符、英文单词或类似音节的发声单位、数字和会读出的符号。忽略标点、空格和非发声符号。',
        '镜头时长绝不能短于估算台词时长加1秒关键动作缓冲。优先每个镜头放一句台词。只有台词很短且自然可读时，才把多句放进同一个镜头。',
        '图片参考说话者使用：【图1】说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）。没有图像编号的文本定义角色使用：委托人说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）。',
        '每段输出必须是该段原台词/舞台指示本身，保留角色名、对白、动作、情绪和场景提示；不要在这一步生成 Image Prompt、分镜图提示词或最终视频提示词。',
        '禁止按场景、情绪、人物库或素材库重新分段；禁止把完整台本塞进任一单段；禁止在单段里混入其他片段剧情、未出场人物或未出现地点。',
        '素材库只作为分段参考，不要把整个人物库、整套场景库写入分段内容。'
    ].join('\n');
    const extra = String(extraInstruction || '').trim();
    return extra ? `${mainline}\n\n用户额外要求：\n${extra}` : mainline;
}

function buildMainlineSegmentationRule() {
    return [
        '只用于第一页台本分段：分段前先按公式估算台词秒数，再切成15秒以内原台词段落。',
        '台词秒数 = round(有效字符数 * 每字基础秒数 * 语速系数 + 停顿补偿秒数)。每字基础秒数 0.22；默认语速系数 0.85；快速/急促 0.70-0.80；自然/普通 0.85-1.00；缓慢/迟疑/沉重 1.10-1.30。',
        '短逗号/轻微停顿约 0.2 秒；句号/问号/叹号/明显换气约 0.4 秒；省略号/沉默/情绪停顿约 0.6-1.0 秒。',
        '只计算引号内实际发声的中文字符、英文单词或类似音节的发声单位、数字和会读出的符号；忽略标点、空格和非发声符号。',
        '每段预计时长绝不能短于估算台词时长 + 1秒关键动作缓冲；每个视频片段目标接近但不超过15秒。短台词可以按顺序合并到同一个片段，直到下一句会超过15秒才切开；不要把一句短台词单独切成过小片段。单句长台词超过15秒时，才按自然停顿拆开。',
        '输出只保留分段后的原台词/舞台指示，不生成 Image Prompt、分镜图提示词或 Video Prompt。'
    ].join('\n');
}

function estimateSpeechSeconds(text = '') {
    const raw = String(text || '');
    const spokenParts = extractSpokenPartsForTiming(raw);
    const spoken = spokenParts.join('');
    if (!spoken) return 0;

    const cnCount = (spoken.match(/[\u4e00-\u9fff]/g) || []).length;
    const wordCount = (spoken.match(/[A-Za-z]+|\d+(?:\.\d+)?/g) || []).length;
    const symbolCount = (spoken.match(/[%￥$&@#]/g) || []).length;
    const effectiveCount = cnCount + wordCount + symbolCount;
    if (!effectiveCount) return 0;

    const urgent = /急促|快速|快语速|语速快|慌张|喊|大喊|冲口|抢话|吼|赶紧|立刻|马上/.test(raw);
    const slow = /缓慢|慢语速|语速慢|迟疑|沉重|低声|哽咽|停顿|沉默|疲惫|犹豫/.test(raw);
    const speed = urgent ? 0.75 : (slow ? 1.2 : 0.85);
    const pauseSource = spokenParts.join('');
    const commaPause = ((pauseSource.match(/[，、,]/g) || []).length * 0.2);
    const sentencePause = ((pauseSource.match(/[。？！.!?]/g) || []).length * 0.4);
    const ellipsisPause = ((pauseSource.match(/……|\.{3,}/g) || []).length * 0.8);
    return Math.round(effectiveCount * 0.22 * speed + commaPause + sentencePause + ellipsisPause);
}

function extractSpokenPartsForTiming(text = '') {
    const raw = String(text || '');
    const quoted = Array.from(raw.matchAll(/[“"「『](.*?)[”"」』]/g)).map(m => m[1].trim()).filter(Boolean);
    if (quoted.length) return quoted;

    const inferred = inferUnquotedDialogueForTiming(raw);
    return inferred ? [inferred] : [];
}

function inferUnquotedDialogueForTiming(line = '') {
    const raw = String(line || '').trim();
    if (!raw || /^(舞台指示|情景描述|场景|动作|镜头|旁白|环境|音效|音乐)(\s|　|\t|$)/.test(raw)) return '';

    const tabParts = raw.split(/\t+/).map(part => part.trim()).filter(Boolean);
    if (tabParts.length >= 2) {
        const first = tabParts[0];
        const last = tabParts[tabParts.length - 1];
        if (!/^(舞台指示|情景描述|场景|动作|镜头|旁白|环境|音效|音乐)$/.test(first) && last && last !== first) {
            return last;
        }
        return '';
    }

    const parts = raw.split(/\s+/).map(part => part.trim()).filter(Boolean);
    if (parts.length >= 2 && parts[0].length <= 12 && !/[。？！.!?，、,；;：:]/.test(parts[0])) {
        const maybeEmotion = parts.length >= 3 && parts[1].length <= 8 && !/[。？！.!?，、,；;：:]/.test(parts[1]);
        const dialogue = parts.slice(maybeEmotion ? 2 : 1).join('');
        return dialogue || '';
    }
    return '';
}

function isDialogueContinuationLine(line = '') {
    const raw = String(line || '').trim();
    if (!raw || /^(舞台指示|情景描述|场景|动作|镜头|旁白|环境|音效|音乐)(\s|　|\t|$)/.test(raw)) return false;
    return /^[…\.。？！!?，、,]/.test(raw);
}

function getDialogueSpeakerForTiming(line = '', fallbackSpeaker = '') {
    const raw = String(line || '').trim();
    if (!raw || /^(舞台指示|情景描述|场景|动作|镜头|旁白|环境|音效|音乐)(\s|　|\t|$)/.test(raw)) return '';
    if (isDialogueContinuationLine(raw)) return fallbackSpeaker || '';

    const tabParts = raw.split(/\t+/).map(part => part.trim()).filter(Boolean);
    if (tabParts.length >= 2) return tabParts[0] || fallbackSpeaker || '';

    const parts = raw.split(/\s+/).map(part => part.trim()).filter(Boolean);
    if (parts.length >= 2 && parts[0].length <= 12 && !/[。？！.!?，、,；;：:]/.test(parts[0])) {
        return parts[0];
    }
    return fallbackSpeaker || '';
}

function splitDialogueTextIntoTimingChunks(dialogue = '') {
    const text = String(dialogue || '').trim();
    if (!text) return [];
    const sentencePieces = (text.match(/[^。？！!?]+(?:……|[。？！!?]+)?|……/g) || [text])
        .map(part => part.trim())
        .filter(Boolean);
    const chunks = [];
    let current = '';
    sentencePieces.forEach(piece => {
        const candidate = current ? `${current}${piece}` : piece;
        const seconds = estimateSpeechSeconds(`说：“${candidate}”`);
        if (current && seconds + 1 > 15) {
            chunks.push(current);
            current = piece;
        } else {
            current = candidate;
        }
    });
    if (current) chunks.push(current);
    return chunks.length ? chunks : [text];
}

function expandLongDialogueLineForTiming(line = '') {
    const raw = String(line || '').trim();
    const baseSeconds = estimateSpeechSeconds(raw);
    if (!baseSeconds || baseSeconds + 1 <= 15) return [raw];

    const dialogue = inferUnquotedDialogueForTiming(raw) || (isDialogueContinuationLine(raw) ? raw : '');
    if (!dialogue) return [raw];
    const startIndex = raw.lastIndexOf(dialogue);
    const prefix = startIndex >= 0 ? raw.slice(0, startIndex) : '';
    return splitDialogueTextIntoTimingChunks(dialogue).map(chunk => `${prefix}${chunk}`.trim()).filter(Boolean);
}

function estimateSegmentDurationSeconds(text = '') {
    const lines = String(text || '').replace(/\r/g, '').split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return 5;
    let speechSeconds = 0;
    lines.forEach(line => {
        let seconds = estimateSpeechSeconds(line);
        if (!seconds && isDialogueContinuationLine(line)) {
            seconds = estimateSpeechSeconds(`继续说道：“${line}”`);
        }
        speechSeconds += seconds;
    });
    if (speechSeconds > 0) return Math.min(15, Math.max(4, speechSeconds + 1));
    return Math.min(8, Math.max(4, Math.ceil(lines.length * 1.5)));
}

function splitScriptByTimingRule(script = '') {
    const lines = String(script || '')
        .replace(/\r/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .flatMap(line => expandLongDialogueLineForTiming(line));
    if (!lines.length) return '';
    const blocks = [];
    let current = [];
    let currentSpeechSeconds = 0;
    let currentHasDialogue = false;

    const flush = () => {
        const items = current;
        const text = items.map(item => String(item || '').trim()).filter(Boolean).join('\n').trim();
        if (text) blocks.push(text);
        current = [];
        currentSpeechSeconds = 0;
        currentHasDialogue = false;
    };

    lines.forEach(line => {
        let speechSeconds = estimateSpeechSeconds(line);
        if (!speechSeconds && isDialogueContinuationLine(line)) {
            speechSeconds = estimateSpeechSeconds(`继续说道：“${line}”`);
        }
        const hasDialogue = speechSeconds > 0;

        if (!hasDialogue) {
            current.push(line);
            return;
        }

        const projectedDuration = currentSpeechSeconds + speechSeconds + 1;
        if (currentHasDialogue && projectedDuration > 15) {
            flush();
        }

        current.push(line);
        currentSpeechSeconds += speechSeconds;
        currentHasDialogue = true;

        if (currentSpeechSeconds + 1 >= 15) {
            flush();
        }
    });
    flush();
    return blocks.join('\n\n===SCRIPT_SPLIT===\n\n');
}

function splitScriptByTimingRuleParts(script = '') {
    return splitScriptByTimingRule(script)
        .split(/\n\s*===SCRIPT_SPLIT===\s*\n/)
        .map(part => part.trim())
        .filter(Boolean);
}

async function breakdownScript() {
    const input = document.getElementById('breakdownInput');
    const instructionEl = document.getElementById('breakdownInstruction');
    const script = input?.value?.trim() || '';
    if (!script) { showToast('请输入需要拆解的原始剧本', 'warning'); return; }

    const btn = document.getElementById('btnBreakdownScript');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> AI拆解中，可继续操作');
    startInlineLiveProgress('breakdown-script', btn, '正在连接文本模型');
    showToast('剧本拆解任务已提交，可继续操作其他内容', 'info');
    setWorkflowResultEmpty('script-breakdown');

    try {
        document.getElementById('breakdownPlaceholderCard')?.classList.add('hidden');
        document.getElementById('breakdownResultPanel')?.classList.remove('hidden');
        const resultEl = document.getElementById('breakdownResultText');
        if (resultEl) resultEl.value = '';
        document.getElementById('breakdownPartCount').textContent = '生成中';

        const res = await fetch('/api/breakdown-script/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentProject || '',
                script,
                instruction: instructionEl?.value?.trim() || ''
            })
        });
        let finalData = null;
        await readNdjsonStream(res, {
            status(event) {
                updateInlineLiveProgress('breakdown-script', { stage: event.stage, text: event.message || '模型处理中' });
            },
            delta(event) {
                if (resultEl) {
                    resultEl.value += event.text || '';
                    resultEl.scrollTop = resultEl.scrollHeight;
                }
                updateInlineLiveProgress('breakdown-script', {
                    stage: 'streaming',
                    text: `模型正在输出，已收到 ${event.char_count || 0} 字`,
                    charCount: event.char_count || 0
                });
            },
            done(event) {
                finalData = event;
            }
        });
        if (!finalData) throw new Error('流式响应未返回完成事件');
        const data = finalData || {};
        if (resultEl) resultEl.value = data.result || resultEl.value || '';
        document.getElementById('breakdownPartCount').textContent = `${data.part_count || 0}段`;
        updateInlineLiveProgress('breakdown-script', { stage: 'done', text: data.message || '剧本拆解完成', charCount: (data.result || '').length });
        if (currentProject) await loadProjects();
        autoCollapseWorkflowInput('script-breakdown');
        showToast(`剧本拆解完成，共 ${data.part_count || 0} 段`, 'success');
    } catch (e) {
        showToast('剧本拆解请求失败: ' + e.message, 'error');
    } finally {
        stopInlineFakeProgress('breakdown-script');
        resetBtn();
    }
}

async function copyBreakdownToClipboard() {
    const text = getBreakdownText();
    if (!text) { showToast('暂无可复制的拆解结果', 'warning'); return; }
    try {
        await navigator.clipboard.writeText(text);
        showToast('拆解结果已复制到剪贴板', 'success');
    } catch (e) {
        const el = document.getElementById('breakdownResultText');
        el?.select();
        document.execCommand('copy');
        showToast('拆解结果已复制', 'success');
    }
}

function fillBreakdownToVideo() {
    const text = getBreakdownText();
    if (!text) { showToast('暂无拆解结果可填入', 'warning'); return; }
    const target = document.getElementById('scriptInput');
    if (target) {
        target.value = text;
        target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    showToast('已填入视频生成文本框', 'success');
}

function fillBreakdownToStoryboard() {
    const text = getBreakdownText();
    if (!text) { showToast('暂无拆解结果可填入', 'warning'); return; }
    const target = document.getElementById('storyboardScriptInput');
    if (target) target.value = text;
    showToast('已填入分镜生成参考文本；请在制片流水线生成 Image Prompt，再生成分镜图', 'success');
}

function fillBreakdownToVideoAndOpen() {
    fillBreakdownToVideo();
    if (getBreakdownText()) switchToTab('script');
}

function fillBreakdownToStoryboardAndOpen() {
    fillBreakdownToStoryboard();
    if (getBreakdownText()) switchToTab('script');
}

async function processScript() {
    const script = document.getElementById('scriptInput').value.trim();
    if (!script) { showToast('请输入剧本内容', 'warning'); return; }
    const extraInstruction = document.getElementById('scriptProcessInstruction')?.value?.trim() || '';
    const storyboardMainline = isStoryboardModeEnabled();
    const assetScope = getScopedAssetPayload(script);

    const btn = document.getElementById('btnProcess');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> 生成 Image Prompt 中');
    storyboardConfirmed = false;
    showToast(storyboardMainline ? '正在自动分段并生成 Image Prompt，可继续操作其他内容' : '兼容旧流程生成任务已提交，可继续操作其他内容', 'info');

    const directorModeId = document.getElementById('directorModeSelect')?.value || '';
    if (!directorModeId) { showToast('请选择视频模式', 'warning'); resetBtn(); return; }
    startInlineLiveProgress('process-script', btn, '正在连接文本模型');
    setWorkflowResultEmpty('script');

    try {
        document.getElementById('resultPlaceholderCard').classList.add('hidden');
        document.getElementById('storyboardPanel').classList.remove('hidden');
        document.getElementById('rawResultPanel')?.classList.remove('hidden');
        syncStoryboardPromptToggle();
        const panelTitle = document.getElementById('storyboardPanelTitle');
        if (panelTitle) panelTitle.textContent = storyboardMainline ? '📋 片段流水线' : '📋 视频台本预览';
        const resultContent = document.getElementById('resultContent');
        if (resultContent) resultContent.textContent = '';
        document.getElementById('segmentCount').textContent = '生成中';

        const timedSplitParts = storyboardMainline ? splitScriptByTimingRuleParts(script) : [];
        const timedSplitScript = storyboardMainline ? timedSplitParts.join('\n\n===SCRIPT_SPLIT===\n\n') : script;
        const mainlineInstruction = storyboardMainline
            ? `${buildMainlineImagePromptInstruction(extraInstruction)}\n\n前端已按台词估时规则用 ===SCRIPT_SPLIT=== 预切分输入台本；必须严格保留这些片段边界，不要合并，不要重新分段。输出每段时只保留该段原台词/舞台指示本身。`
            : extraInstruction;
        const segmentationRule = storyboardMainline ? buildMainlineSegmentationRule() : '';
        const res = await fetch('/api/process-script/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentProject || '',
                script: timedSplitScript,
                original_script: script,
                presegmented_script: timedSplitScript,
                scenes: assetScope.scenes,
                characters: assetScope.characters,
                director_mode_id: directorModeId,
                instruction: mainlineInstruction,
                fixed_instruction: mainlineInstruction,
                segmentation_rule: segmentationRule,
                storyboard_mode: storyboardMainline,
                storyboard_ratio: getStoryboardRatio()
            })
        });
        let finalData = null;
        await readNdjsonStream(res, {
            status(event) {
                updateInlineLiveProgress('process-script', { stage: event.stage, text: event.message || '模型处理中' });
            },
            delta(event) {
                if (resultContent) {
                    resultContent.textContent += event.text || '';
                    resultContent.scrollTop = resultContent.scrollHeight;
                }
                updateInlineLiveProgress('process-script', {
                    stage: 'streaming',
                    text: `模型正在输出，已收到 ${event.char_count || 0} 字`,
                    charCount: event.char_count || 0
                });
            },
            done(event) {
                finalData = event;
            }
        });
        if (!finalData) throw new Error('流式响应未返回完成事件');
        const data = finalData || {};

        // 保存结果
        currentProject = data.project_id;
        currentSegments = data.segments || [];
        if (storyboardMainline) {
            if (timedSplitParts.length && currentSegments.length !== timedSplitParts.length) {
                console.warn('第一页分段数量与后端返回数量不一致，前端将优先显示本地按台词估时规则切出的原台词片段。', {
                    timingParts: timedSplitParts.length,
                    backendSegments: currentSegments.length
                });
            }
            const backendSegments = currentSegments;
            currentSegments = timedSplitParts.map((part, index) => {
                const seg = backendSegments[index] || {};
                const sourceText = (part || seg.prompt_text || seg.prompt || seg._original || '').trim();
                const duration = estimateSegmentDurationSeconds(sourceText);
                return {
                    ...seg,
                    segment_index: index,
                    duration,
                    prompt: sourceText,
                    prompt_text: sourceText,
                    _original: sourceText,
                    storyboard_prompt: '',
                    storyboard_status: '',
                    storyboard_image_path: '',
                    end_storyboard_prompt: '',
                    end_storyboard_status: '',
                    end_storyboard_image_path: ''
                };
            });
        }
        activeSegmentEditIndex = 0;
        await loadProjects();
        currentProjectInfo = projectsCache.find(p => p.id === currentProject) || currentProjectInfo;
        updateCurrentProjectBar();

        // 填充原始文本
        document.getElementById('resultContent').textContent = storyboardMainline ? timedSplitScript : data.result;

        // 更新片段数
        const segmentCount = currentSegments.length || data.segment_count || 0;
        document.getElementById('segmentCount').textContent = storyboardMainline ? `${segmentCount}个Image段落` : `${segmentCount}个片段`;

        activeProductionFlowStep = 'script';
        setWorkflowOutputCollapsed('script', false, { manual: true });
        setWorkflowInputCollapsed('script', false, { manual: true });

        // 渲染原台词分段，并交给逐段任务生成 Image Prompt
        renderSegments(currentSegments);

        updateInlineLiveProgress('process-script', { stage: 'done', text: data.message || (storyboardMainline ? 'Image Prompt 生成完成' : '视频台本生成完成'), charCount: (data.result || '').length });
        showToast(
            storyboardMainline
                ? `已建立 ${segmentCount} 个原台词分段，正在后台逐段生成 Image Prompt`
                : `处理完成，共${segmentCount}个视频片段，请预览并编辑视频台本`,
            'success'
        );
        if (storyboardMainline) {
            setTimeout(() => autoGenerateStoryboardPromptsAfterScript(), 0);
        }

    } catch (e) {
        showToast('请求失败: ' + getFriendlyGenerationError(e.message), 'error');
    } finally {
        stopInlineFakeProgress('process-script');
        resetBtn();
    }
}

async function prepareProjectUe5JsonText() {
    if (!currentProject || !currentSegments.length) {
        showToast('请先生成片段流水线内容后再整理导入引擎台本', 'warning');
        return;
    }

    const btn = document.getElementById('btnPrepareUe5JsonText');
    const status = document.getElementById('ue5PreparedStatus');
    const preparedTarget = document.getElementById('ue5JsonPreparedText');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> GPT整理中');
    if (status) status.textContent = '整理中';
    if (preparedTarget) preparedTarget.value = '';
    clearUe5JsonGeneratedResult('确认稿重新整理中，旧 JSON 已失效。');
    startInlineLiveProgress('ue5-json-prepare', btn, '正在整理台本确认稿');

    try {
        await Promise.allSettled(currentSegments.map((_, index) => saveSegmentState(index)));
        const res = await fetch(`/api/projects/${currentProject}/ue5-cutscene-text/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'ue5_cutscene_json' })
        });
        let finalData = null;
        await readNdjsonStream(res, {
            status(event) {
                updateInlineLiveProgress('ue5-json-prepare', { stage: event.stage, text: event.message || '台本整理中' });
            },
            delta(event) {
                if (preparedTarget) {
                    preparedTarget.value += event.text || '';
                    preparedTarget.scrollTop = preparedTarget.scrollHeight;
                }
                updateInlineLiveProgress('ue5-json-prepare', {
                    stage: 'streaming',
                    text: `正在输出确认稿，已收到 ${event.char_count || 0} 字`,
                    charCount: event.char_count || 0
                });
            },
            done(event) {
                finalData = event;
            }
        });
        if (!finalData) throw new Error('流式响应未返回完成事件');
        const data = finalData;
        if (preparedTarget && data.prepared_text) preparedTarget.value = data.prepared_text;
        ue5JsonPreparedFromProject = true;
        if (status) status.textContent = '待确认';
        updateInlineLiveProgress('ue5-json-prepare', { stage: 'done', text: data.message || '确认稿已生成', charCount: (data.prepared_text || '').length });
        syncUe5JsonStepVisibility({ focus: true });
        scheduleUe5JsonStateSave();
        showToast('台本确认稿已生成，请检查并修改后再导出 JSON', 'success');
    } catch (e) {
        if (status) status.textContent = '失败';
        scheduleUe5JsonStateSave();
        showToast(formatActionError('整理导入确认稿失败: ', e.message), 'error');
    } finally {
        stopInlineFakeProgress('ue5-json-prepare');
        resetBtn();
        updateUe5JsonActionLabels();
    }
}

async function generateProjectUe5Json() {
    return prepareProjectUe5JsonText();
}

function getSegmentReferenceImages(seg) {
    if (!seg) return [];
    if (Array.isArray(seg.reference_images)) return seg.reference_images;
    if (typeof seg.reference_images === 'string' && seg.reference_images.trim()) {
        try {
            const parsed = JSON.parse(seg.reference_images);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(seg._libraryImages) ? seg._libraryImages : [];
}

function formatAssetForUe5Text(kind, id, asset) {
    if (!asset) return kind === 'char' ? `未知人物` : `未知场景`;
    if (kind === 'char') {
        const desc = asset.description ? `，${asset.description}` : '';
        return `人物：${asset.name || id}${desc}`;
    }
    const desc = asset.description ? `，${asset.description}` : '';
    return `场景：${asset.name || id}${desc}`;
}

function expandUe5PromptMentions(text) {
    const promptRe = getPromptMentionTokenRegex();
    if (!promptRe) return text;
    return text.replace(promptRe, (full, title) => {
        const item = promptLibrary.find(p => String(p.title || '').toLowerCase() === String(title || '').toLowerCase());
        if (!item) return full;
        return item.content ? `提示词要求：${item.content}` : '';
    });
}

function expandSegmentMentionsForUe5Text(text, seg) {
    if (!text) return '';
    let expanded = String(text);
    expanded = expanded.replace(MENTION_REGEX_GLOBAL, (full, kind, id) => {
        const asset = lookupMentionAsset(kind, id);
        return formatAssetForUe5Text(kind, id, asset);
    });
    expanded = expandUe5PromptMentions(expanded);

    const refs = getSegmentReferenceImages(seg);
    if (refs.length) {
        expanded = expanded.replace(LEGACY_REF_REGEX_GLOBAL, (full, num) => {
            const idx = parseInt(num, 10) - 1;
            if (idx < 0 || idx >= refs.length) return full;
            const refPath = refs[idx];
            const charAsset = characters.find(c => c.image_path === refPath);
            if (charAsset) return `人物：${charAsset.name || charAsset.id}${charAsset.description ? `，${charAsset.description}` : ''}`;
            const sceneAsset = scenes.find(s => s.image_path === refPath);
            if (sceneAsset) return `场景：${sceneAsset.name || sceneAsset.id}${sceneAsset.description ? `，${sceneAsset.description}` : ''}`;
            return full;
        });
    }
    return expanded;
}

function isUe5UsefulHeading(line) {
    return /^(角色形象声明|角色标签声明|出场人物|场景信息声明|场景连续性声明|全局连续性锁定声明|本片段开场状态|本片段场景设定在|分镜\s*\d+|镜头\s*\d+|本片段结束状态|片段\s*\d+)/.test(line);
}

function cleanImportedUe5SegmentText(text) {
    const skipSectionHeadings = /^(画面风格和限制|画面风格和类型|视频信息|视频时长)\s*$/;
    const noisyLineRe = /(不得出现|严禁出现|无文字|无字幕|字幕|UI|Logo|水印|对话框|可读文字|画质|高质量|二次元开放世界|实时渲染|鸣潮|风格统一|风格只能写|平台|视频生成工具)/i;
    const metadataLineRe = /^(segment_id|storyboard_count|prompt_text|分镜文本)\s*[:：]/i;
    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const kept = [];
    let skippingSection = false;

    for (const rawLine of lines) {
        let line = rawLine.trim();
        if (!line) {
            if (kept.length && kept[kept.length - 1] !== '') kept.push('');
            continue;
        }

        if (skipSectionHeadings.test(line)) {
            skippingSection = true;
            continue;
        }
        if (skippingSection) {
            if (!isUe5UsefulHeading(line)) continue;
            skippingSection = false;
        }

        if (metadataLineRe.test(line)) continue;
        if (/^说明[:：]/.test(line)) continue;
        if (noisyLineRe.test(line) && !/^分镜\s*\d+/.test(line)) continue;

        line = line
            .replace(/^角色标签声明$/, '出场人物')
            .replace(/@(?:char|scene):[A-Za-z0-9_\-]{1,64}/g, '')
            .replace(/（\s*素材未找到\s*）/g, '')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\s+，/g, '，')
            .replace(/，\s*，/g, '，')
            .trim();

        if (!line) continue;
        kept.push(line);
    }

    return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function readSegmentPromptForUe5(index, seg) {
    const editor = document.getElementById(`segEditor-${index}`);
    const rawText = (editor ? readMentionEditorValue(editor) : (seg.prompt || seg.prompt_text || '')).trim();
    if (rawText) {
        seg.prompt = rawText;
        seg.prompt_text = rawText;
    }
    return cleanImportedUe5SegmentText(expandSegmentMentionsForUe5Text(rawText, seg));
}

function buildAllSegmentsUe5Text() {
    const projectName = currentProjectInfo?.name || currentProject || '当前项目';
    const blocks = currentSegments.map((seg, index) => {
        normalizeSegmentState(seg);
        const prompt = readSegmentPromptForUe5(index, seg);
        const durationInput = document.getElementById(`segDuration-${index}`);
        const duration = durationInput?.value || seg.duration || '';
        const sceneName = scenes.find(s => s.id === seg.scene_id)?.name || seg.scene || '';
        return [
            `片段 ${index + 1}${duration ? `（约${duration}秒）` : ''}`,
            sceneName ? `场景：${sceneName}` : '',
            prompt || '(空)',
        ].filter(Boolean).join('\n');
    });

    return [
        '导入引擎生成用分镜文本',
        `项目：${projectName}`,
        blocks.join('\n\n---\n\n'),
    ].join('\n\n');
}

function importSegmentsToUe5JsonText() {
    if (!currentSegments.length) {
        showToast('请先生成片段流水线内容，再导入到导入引擎', 'warning');
        return;
    }
    const text = buildAllSegmentsUe5Text().trim();
    if (!text) {
        showToast('当前没有可导入的分镜文本', 'warning');
        return;
    }
    const target = document.getElementById('ue5JsonTextInput');
    if (!target) {
        showToast('找不到导入引擎处理框', 'error');
        return;
    }
    ue5JsonSourceFromProject = true;
    target.value = text;
    target.dispatchEvent(new Event('input', { bubbles: true }));
    ue5JsonSourceFromProject = true;
    const preparedTarget = document.getElementById('ue5JsonPreparedText');
    if (preparedTarget) preparedTarget.value = '';
    const preparedStatus = document.getElementById('ue5PreparedStatus');
    if (preparedStatus) preparedStatus.textContent = '待整理';
    ue5JsonPreparedFromProject = false;
    updateUe5JsonActionLabels();
    scheduleUe5JsonStateSave();
    switchToTab('ue5-json');
    target.focus();
    showToast(`已导入 ${currentSegments.length} 个片段，请先执行第一步整理`, 'success');
}

function collectUe5JsonDraftRoles() {
    return Array.from(document.querySelectorAll('.ue5-json-role-row')).map(row => ({
        name: row.querySelector('.ue5-role-name')?.value?.trim() || '',
        note: row.querySelector('.ue5-role-note')?.value?.trim() || ''
    })).filter(role => role.name || role.note);
}

function getUe5JsonDetailsState() {
    const videoDetails = document.getElementById('ue5JsonVideoInput')?.closest('details');
    const roleDetails = document.getElementById('ue5JsonRoleRows')?.closest('details');
    return {
        video: Boolean(videoDetails?.open),
        roles: Boolean(roleDetails?.open)
    };
}

function setUe5JsonDetailsState(details = {}) {
    const videoDetails = document.getElementById('ue5JsonVideoInput')?.closest('details');
    const roleDetails = document.getElementById('ue5JsonRoleRows')?.closest('details');
    if (videoDetails) videoDetails.open = Boolean(details.video);
    if (roleDetails) roleDetails.open = Boolean(details.roles);
}

function getUe5JsonStorageProjectId(projectId = currentProject) {
    return projectId || '__standalone__';
}

function getUe5JsonStorageKey(projectId = currentProject) {
    return `${UE5_JSON_STORAGE_KEY}:${getUe5JsonStorageProjectId(projectId)}`;
}

function buildEmptyUe5JsonPersistentState(project = currentProjectInfo) {
    const projectScript = project?.script_text || '';
    return {
        text: projectScript || '',
        preparedText: '',
        preparedStatus: projectScript ? '待整理' : '待整理',
        resultStatus: '待生成',
        summary: '完成第一步确认稿后，点击第二步导出 JSON，结果会自动下载并在这里预览。',
        roles: [],
        details: { video: false, roles: false },
        lastResult: null,
        lastFilename: '',
        preparedFromProject: false,
        sourceFromProject: false,
        editorState: { shotIndex: 0, cameraKeyIndex: 0 },
        savedAt: Date.now()
    };
}

function buildUe5JsonPersistentState() {
    return {
        text: document.getElementById('ue5JsonTextInput')?.value || '',
        preparedText: document.getElementById('ue5JsonPreparedText')?.value || '',
        preparedStatus: document.getElementById('ue5PreparedStatus')?.textContent || '待整理',
        resultStatus: document.getElementById('ue5JsonStatus')?.textContent || '待生成',
        summary: document.getElementById('ue5JsonSummary')?.textContent || '',
        roles: collectUe5JsonDraftRoles(),
        details: getUe5JsonDetailsState(),
        lastResult: ue5JsonLastResult || null,
        lastFilename: ue5JsonLastFilename || '',
        preparedFromProject: Boolean(ue5JsonPreparedFromProject),
        sourceFromProject: Boolean(ue5JsonSourceFromProject),
        editorState: {
            shotIndex: ue5JsonEditorState.shotIndex || 0,
            cameraKeyIndex: ue5JsonEditorState.cameraKeyIndex || 0
        },
        savedAt: Date.now()
    };
}

function scheduleUe5JsonStateSave() {
    if (!ue5JsonStateRestored || ue5JsonApplyingState) return;
    clearTimeout(ue5JsonSaveTimer);
    ue5JsonSaveTimer = setTimeout(saveUe5JsonPersistentState, 250);
}

function saveUe5JsonPersistentState(projectId = currentProject) {
    try {
        const state = {
            ...buildUe5JsonPersistentState(),
            projectId: getUe5JsonStorageProjectId(projectId)
        };
        localStorage.setItem(getUe5JsonStorageKey(projectId), JSON.stringify(state));
    } catch (e) {
        console.warn('导入引擎状态保存失败:', e);
    }
}

function readUe5JsonPersistentState(projectId = currentProject) {
    try {
        const state = JSON.parse(localStorage.getItem(getUe5JsonStorageKey(projectId)) || 'null');
        if (state && typeof state === 'object') return state;
    } catch (e) {
        return null;
    }
    return null;
}

function readLegacyUe5JsonPersistentState() {
    try {
        const state = JSON.parse(localStorage.getItem(UE5_JSON_STORAGE_KEY) || 'null');
        if (state && typeof state === 'object') return state;
    } catch (e) {
        return null;
    }
    return null;
}

function applyUe5JsonPersistentState(state) {
    const sourceInput = document.getElementById('ue5JsonTextInput');
    const preparedInput = document.getElementById('ue5JsonPreparedText');
    const preparedStatus = document.getElementById('ue5PreparedStatus');
    const resultStatus = document.getElementById('ue5JsonStatus');
    const summary = document.getElementById('ue5JsonSummary');
    const roleList = document.getElementById('ue5JsonRoleRows');
    const preview = document.getElementById('ue5JsonPreview');
    const downloadBtn = document.getElementById('btnDownloadUe5JsonDirect');

    if (sourceInput) sourceInput.value = state.text || '';
    if (preparedInput) preparedInput.value = state.preparedText || '';
    if (preparedStatus) preparedStatus.textContent = state.preparedStatus || (state.preparedText ? '待确认' : '待整理');
    if (resultStatus) resultStatus.textContent = state.resultStatus || '待生成';
    if (summary) summary.textContent = state.summary || '完成第一步确认稿后，点击第二步导出 JSON，结果会自动下载并在这里预览。';
    if (preview) preview.textContent = '{}';
    if (downloadBtn) downloadBtn.classList.add('hidden');

    if (roleList) {
        roleList.innerHTML = '';
        if (Array.isArray(state.roles)) {
            state.roles.forEach(role => addUe5RoleRow(role));
        }
    }
    setUe5JsonDetailsState(state.details || {});

    ue5JsonPreparedFromProject = Boolean(state.preparedFromProject);
    ue5JsonSourceFromProject = Boolean(state.sourceFromProject);
    ue5JsonLastFilename = state.lastFilename || '';
    ue5JsonLastResult = null;
    ue5JsonEditorState.shotIndex = Math.max(0, Number(state.editorState?.shotIndex) || 0);
    ue5JsonEditorState.cameraKeyIndex = Math.max(0, Number(state.editorState?.cameraKeyIndex) || 0);
    loadUe5JsonIntoCameraEditor(null);
    if (state.lastResult && typeof state.lastResult === 'object') {
        ue5JsonLastResult = normalizeUe5JsonForEditor(state.lastResult);
        if (preview) preview.textContent = JSON.stringify(ue5JsonLastResult, null, 2);
        downloadBtn?.classList.remove('hidden');
        loadUe5JsonIntoCameraEditor(ue5JsonLastResult);
        autoCollapseWorkflowInput('ue5-json');
        if (state.editorState) {
            ue5JsonEditorState.shotIndex = Math.max(0, Number(state.editorState.shotIndex) || 0);
            ue5JsonEditorState.cameraKeyIndex = Math.max(0, Number(state.editorState.cameraKeyIndex) || 0);
            refreshUe5CameraSelectors();
            syncUe5CameraEditorFromSelection();
        }
    } else {
        setWorkflowResultEmpty('ue5-json');
    }
    updateUe5JsonActionLabels();
}

function restoreUe5JsonPersistentState(projectId = currentProject, options = {}) {
    const project = projectsCache.find(p => p.id === projectId) || currentProjectInfo;
    let migratedLegacy = false;
    let state = options.reset
        ? buildEmptyUe5JsonPersistentState(project)
        : readUe5JsonPersistentState(projectId);
    if (!state && !options.reset && !localStorage.getItem(`${UE5_JSON_STORAGE_KEY}:migrated`)) {
        state = readLegacyUe5JsonPersistentState();
        migratedLegacy = Boolean(state);
    }
    if (!state) state = buildEmptyUe5JsonPersistentState(project);
    ue5JsonApplyingState = true;
    try {
        applyUe5JsonPersistentState(state);
    } finally {
        ue5JsonApplyingState = false;
    }
    ue5JsonStateRestored = true;
    ue5JsonLoadedProjectId = getUe5JsonStorageProjectId(projectId);
    if (migratedLegacy) {
        localStorage.setItem(`${UE5_JSON_STORAGE_KEY}:migrated`, ue5JsonLoadedProjectId);
        saveUe5JsonPersistentState(projectId);
    } else if (options.createIfMissing && !readUe5JsonPersistentState(projectId)) {
        saveUe5JsonPersistentState(projectId);
    }
}

function activateUe5JsonStateForCurrentProject(options = {}) {
    restoreUe5JsonPersistentState(currentProject, options);
}

function saveActiveUe5JsonStateBeforeProjectChange() {
    if (!ue5JsonStateRestored || ue5JsonApplyingState) return;
    saveUe5JsonPersistentState(ue5JsonLoadedProjectId === '__standalone__' ? null : ue5JsonLoadedProjectId);
}

function removeUe5JsonPersistentStateForProject(projectId) {
    try {
        localStorage.removeItem(getUe5JsonStorageKey(projectId));
    } catch (e) {
        console.warn('导入引擎项目状态删除失败:', e);
    }
}

function copyUe5JsonPersistentState(sourceProjectId, targetProjectId) {
    if (!sourceProjectId || !targetProjectId) return;
    const sourceState = readUe5JsonPersistentState(sourceProjectId);
    if (!sourceState) return;
    try {
        localStorage.setItem(getUe5JsonStorageKey(targetProjectId), JSON.stringify({
            ...sourceState,
            projectId: getUe5JsonStorageProjectId(targetProjectId),
            savedAt: Date.now()
        }));
    } catch (e) {
        console.warn('导入引擎项目状态复制失败:', e);
    }
}

function clearUe5JsonGeneratedResult(summaryText = '') {
    ue5JsonLastResult = null;
    ue5JsonLastFilename = '';
    ue5JsonEditorState.shotIndex = 0;
    ue5JsonEditorState.cameraKeyIndex = 0;
    const status = document.getElementById('ue5JsonStatus');
    const summary = document.getElementById('ue5JsonSummary');
    const preview = document.getElementById('ue5JsonPreview');
    if (status) status.textContent = '待生成';
    if (summary) summary.textContent = summaryText || '确认稿已变化，请重新导出 JSON。';
    if (preview) preview.textContent = '{}';
    document.getElementById('btnDownloadUe5JsonDirect')?.classList.add('hidden');
    loadUe5JsonIntoCameraEditor(null);
    updateUe5JsonActionLabels();
    setWorkflowResultEmpty('ue5-json');
}

function syncUe5JsonStepVisibility(options = {}) {
    const sourceCard = document.getElementById('ue5JsonSourceStepCard');
    const preparedCard = document.getElementById('ue5JsonPreparedStepCard');
    const preparedInput = document.getElementById('ue5JsonPreparedText');
    const generateBtn = document.getElementById('btnGenerateUe5JsonDirect');
    const hasPreparedText = Boolean(preparedInput?.value?.trim());

    sourceCard?.classList.toggle('ue5-json-step-hidden', hasPreparedText);
    preparedCard?.classList.toggle('ue5-json-step-hidden', !hasPreparedText);
    generateBtn?.classList.toggle('ue5-json-step-hidden', !hasPreparedText);

    if (hasPreparedText && options.focus) {
        const focusPreparedStep = () => {
            preparedCard?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
            preparedInput?.focus?.();
        };
        if (typeof setTimeout === 'function') setTimeout(focusPreparedStep, 0);
        else focusPreparedStep();
    }

    return hasPreparedText;
}

function updateUe5JsonActionLabels() {
    const prepareBtn = document.getElementById('btnPrepareUe5JsonText');
    const generateBtn = document.getElementById('btnGenerateUe5JsonDirect');
    const preparedText = document.getElementById('ue5JsonPreparedText')?.value?.trim() || '';
    if (prepareBtn && !prepareBtn.disabled) {
        prepareBtn.innerHTML = preparedText
            ? '<span class="btn-icon">🧠</span> 重新整理确认稿'
            : '<span class="btn-icon">🧠</span> 第一步：GPT整理台本';
    }
    if (generateBtn && !generateBtn.disabled) {
        generateBtn.innerHTML = ue5JsonLastResult
            ? '<span class="btn-icon">📦</span> 重新生成 JSON'
            : '<span class="btn-icon">📦</span> 第二步：一键导出 JSON';
    }
    syncUe5JsonStepVisibility();
}

function bindUe5JsonPersistence() {
    const preparedInput = document.getElementById('ue5JsonPreparedText');
    if (preparedInput && !preparedInput.dataset.ue5PersistenceWatcher) {
        preparedInput.dataset.ue5PersistenceWatcher = '1';
        preparedInput.addEventListener('input', () => {
            const status = document.getElementById('ue5PreparedStatus');
            if (status && preparedInput.value.trim()) status.textContent = '待确认';
            clearUe5JsonGeneratedResult();
            updateUe5JsonActionLabels();
            scheduleUe5JsonStateSave();
        });
    }

    const roleList = document.getElementById('ue5JsonRoleRows');
    if (roleList && !roleList.dataset.ue5PersistenceWatcher) {
        roleList.dataset.ue5PersistenceWatcher = '1';
        roleList.addEventListener('input', scheduleUe5JsonStateSave);
        roleList.addEventListener('change', scheduleUe5JsonStateSave);
    }

    [
        document.getElementById('ue5JsonVideoInput')?.closest('details'),
        document.getElementById('ue5JsonRoleRows')?.closest('details')
    ].forEach(details => {
        if (!details || details.dataset.ue5PersistenceWatcher) return;
        details.dataset.ue5PersistenceWatcher = '1';
        details.addEventListener('toggle', scheduleUe5JsonStateSave);
    });
}

function initUe5JsonMode() {
    // 导入引擎模式默认先收集原始台本，确认稿生成后再切到第二步。
    const list = document.getElementById('ue5JsonRoleRows');
    const storageProjectId = getUe5JsonStorageProjectId(currentProject);
    if (!ue5JsonStateRestored || ue5JsonLoadedProjectId !== storageProjectId) {
        restoreUe5JsonPersistentState(currentProject);
    }
    bindUe5JsonPersistence();
    if (list) renumberUe5RoleRows();
    const sourceInput = document.getElementById('ue5JsonTextInput');
    if (sourceInput && !sourceInput.dataset.ue5SourceWatcher) {
        sourceInput.dataset.ue5SourceWatcher = '1';
        sourceInput.addEventListener('input', () => {
            ue5JsonSourceFromProject = false;
            ue5JsonPreparedFromProject = false;
            const status = document.getElementById('ue5PreparedStatus');
            if (status) status.textContent = '待整理';
            const preparedInput = document.getElementById('ue5JsonPreparedText');
            if (preparedInput?.value.trim()) preparedInput.value = '';
            clearUe5JsonGeneratedResult('原始台本已变化，请重新整理确认稿。');
            updateUe5JsonActionLabels();
            scheduleUe5JsonStateSave();
        });
    }
    updateUe5JsonActionLabels();
}

async function prepareUe5JsonText() {
    const source = document.getElementById('ue5JsonTextInput')?.value?.trim() || '';
    if (!source) {
        showToast('请先粘贴原始台本，或从视频生成页导入', 'warning');
        return;
    }

    const btn = document.getElementById('btnPrepareUe5JsonText');
    const preparedTarget = document.getElementById('ue5JsonPreparedText');
    const status = document.getElementById('ue5PreparedStatus');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> GPT整理中');
    if (preparedTarget) preparedTarget.value = '';
    if (status) status.textContent = '整理中';
    clearUe5JsonGeneratedResult('确认稿重新整理中，旧 JSON 已失效。');
    startInlineLiveProgress('ue5-json-prepare', btn, '正在整理台本确认稿');

    try {
        const res = await fetch('/api/ue5-json/prepare/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: source })
        });
        let finalData = null;
        await readNdjsonStream(res, {
            status(event) {
                updateInlineLiveProgress('ue5-json-prepare', { stage: event.stage, text: event.message || '台本整理中' });
            },
            delta(event) {
                if (preparedTarget) {
                    preparedTarget.value += event.text || '';
                    preparedTarget.scrollTop = preparedTarget.scrollHeight;
                }
                updateInlineLiveProgress('ue5-json-prepare', {
                    stage: 'streaming',
                    text: `正在输出确认稿，已收到 ${event.char_count || 0} 字`,
                    charCount: event.char_count || 0
                });
            },
            done(event) {
                finalData = event;
            }
        });
        if (!finalData) throw new Error('流式响应未返回完成事件');
        if (preparedTarget && finalData.prepared_text) preparedTarget.value = finalData.prepared_text;
        if (status) status.textContent = '待确认';
        ue5JsonPreparedFromProject = Boolean(ue5JsonSourceFromProject && currentProject && currentSegments.length);
        updateInlineLiveProgress('ue5-json-prepare', { stage: 'done', text: finalData.message || '确认稿已生成', charCount: (finalData.prepared_text || '').length });
        syncUe5JsonStepVisibility({ focus: true });
        scheduleUe5JsonStateSave();
        showToast('台本确认稿已生成，请检查并修改后再导出 JSON', 'success');
    } catch (e) {
        if (status) status.textContent = '失败';
        scheduleUe5JsonStateSave();
        showToast(formatActionError('整理导入确认稿失败: ', e.message), 'error');
    } finally {
        stopInlineFakeProgress('ue5-json-prepare');
        resetBtn();
        updateUe5JsonActionLabels();
    }
}

function addUe5RoleRow(prefill = {}) {
    const list = document.getElementById('ue5JsonRoleRows');
    if (!list) return;
    const id = ++ue5JsonRoleSeq;
    const row = document.createElement('div');
    row.className = 'ue5-json-role-row';
    row.dataset.roleRowId = String(id);
    row.innerHTML = `
        <div class="ue5-json-role-head">
            <strong>角色 ${list.children.length + 1}</strong>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeUe5RoleRow(${id})">删除</button>
        </div>
        <div class="ue5-json-role-grid">
            <label>角色名<input type="text" class="ue5-role-name" placeholder="例如：温泪" value="${escAttr(prefill.name || '')}"></label>
            <label>角色说明<input type="text" class="ue5-role-note" placeholder="例如：白发少女，视频中的左侧角色" value="${escAttr(prefill.note || '')}"></label>
        </div>
        <div class="ue5-json-role-file">
            <input type="file" class="ue5-role-image" accept="image/*" onchange="onUe5RoleImageChange(this)">
            <div class="ue5-json-role-preview empty-state"><p>角色图预览</p></div>
        </div>
    `;
    list.appendChild(row);
    renumberUe5RoleRows();
    scheduleUe5JsonStateSave();
}

function removeUe5RoleRow(id) {
    const row = document.querySelector(`.ue5-json-role-row[data-role-row-id="${id}"]`);
    if (row) row.remove();
    renumberUe5RoleRows();
    scheduleUe5JsonStateSave();
}

function renumberUe5RoleRows() {
    document.querySelectorAll('.ue5-json-role-row').forEach((row, index) => {
        const title = row.querySelector('.ue5-json-role-head strong');
        if (title) title.textContent = `角色 ${index + 1}`;
    });
}

function onUe5RoleImageChange(input) {
    const preview = input?.closest('.ue5-json-role-file')?.querySelector('.ue5-json-role-preview');
    const file = input?.files?.[0];
    if (!preview) return;
    if (!file) {
        preview.className = 'ue5-json-role-preview empty-state';
        preview.innerHTML = '<p>角色图预览</p>';
        return;
    }
    const url = URL.createObjectURL(file);
    preview.className = 'ue5-json-role-preview';
    preview.innerHTML = `<img src="${escAttr(url)}" alt="角色图预览">`;
}

function onUe5JsonVideoChange() {
    const input = document.getElementById('ue5JsonVideoInput');
    const preview = document.getElementById('ue5JsonVideoPreview');
    const hint = document.getElementById('ue5JsonVideoHint');
    const file = input?.files?.[0];
    if (ue5JsonVideoObjectUrl) {
        URL.revokeObjectURL(ue5JsonVideoObjectUrl);
        ue5JsonVideoObjectUrl = '';
    }
    if (!preview) return;
    if (!file) {
        preview.className = 'ue5-json-video-preview empty-state';
        preview.innerHTML = '<p>选择视频后将在这里预览</p>';
        if (hint) hint.textContent = '可上传最终视频或参考视频，系统会抽取关键帧给 AI 辅助判断镜头、角色位置和运镜。';
        scheduleUe5JsonStateSave();
        return;
    }
    ue5JsonVideoObjectUrl = URL.createObjectURL(file);
    preview.className = 'ue5-json-video-preview';
    preview.innerHTML = `<video src="${escAttr(ue5JsonVideoObjectUrl)}" controls preload="metadata"></video>`;
    if (hint) hint.textContent = `${file.name} · ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB`;
    scheduleUe5JsonStateSave();
}

function collectUe5RoleMappings(formData) {
    const roles = [];
    document.querySelectorAll('.ue5-json-role-row').forEach((row, index) => {
        const name = row.querySelector('.ue5-role-name')?.value?.trim() || '';
        const note = row.querySelector('.ue5-role-note')?.value?.trim() || '';
        const file = row.querySelector('.ue5-role-image')?.files?.[0] || null;
        if (!name && !note && !file) return;
        roles.push({ index, name, note, has_image: Boolean(file) });
        if (file) formData.append(`role_image_${index}`, file);
    });
    return roles;
}

async function generateUe5JsonDirect() {
    const videoInput = document.getElementById('ue5JsonVideoInput');
    const videoFile = videoInput?.files?.[0];
    const preparedText = document.getElementById('ue5JsonPreparedText')?.value?.trim() || '';
    const fallbackText = document.getElementById('ue5JsonTextInput')?.value?.trim() || '';
    const text = preparedText || fallbackText;
    if (!text && !videoFile) {
        showToast('请先完成第一步台本整理，并确认或修改后再导出 JSON', 'warning');
        return;
    }
    if (!preparedText && fallbackText) {
        showToast('建议先点击第一步 GPT整理台本，再导出 JSON', 'warning');
        return;
    }

    const btn = document.getElementById('btnGenerateUe5JsonDirect');
    const status = document.getElementById('ue5JsonStatus');
    const summary = document.getElementById('ue5JsonSummary');
    const preview = document.getElementById('ue5JsonPreview');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> 正在生成导入文件');
    ue5JsonLastResult = null;
    ue5JsonLastFilename = '';
    document.getElementById('btnDownloadUe5JsonDirect')?.classList.add('hidden');
    loadUe5JsonIntoCameraEditor(null);
    setWorkflowResultEmpty('ue5-json');
    if (status) status.textContent = '生成中';
    if (summary) {
        summary.textContent = videoFile
            ? '正在读取文本、上传参考素材并生成导入引擎文件...'
            : '正在根据文本生成导入引擎文件...';
    }
    if (preview) preview.textContent = '';
    startInlineLiveProgress('ue5-json-direct', btn, videoFile ? '正在处理参考素材' : '正在连接文本模型');

    try {
        if (ue5JsonPreparedFromProject && currentProject) {
            await generateUe5JsonFromPreparedProject(text, btn, status, summary, preview);
            return;
        }

        const formData = new FormData();
        if (videoFile) formData.append('video', videoFile);
        formData.append('text', text);
        const roles = collectUe5RoleMappings(formData);
        formData.append('roles_json', JSON.stringify(roles));

        const res = await fetch('/api/ue5-json/generate/stream', { method: 'POST', body: formData });
        let finalData = null;
        await readNdjsonStream(res, {
            status(event) {
                if (summary) summary.textContent = event.message || '导入引擎生成中...';
                updateInlineLiveProgress('ue5-json-direct', { stage: event.stage, text: event.message || '导入引擎生成中' });
            },
            delta(event) {
                if (preview) {
                    preview.textContent += event.text || '';
                    preview.scrollTop = preview.scrollHeight;
                }
                updateInlineLiveProgress('ue5-json-direct', {
                    stage: 'json_streaming',
                    text: `模型正在输出 JSON，已收到 ${event.char_count || 0} 字`,
                    charCount: event.char_count || 0
                });
            },
            done(event) {
                finalData = event;
            }
        });
        if (!finalData) throw new Error('流式响应未返回完成事件');
        const data = finalData;

        ue5JsonLastResult = data.cutscene_json || {};
        ue5JsonLastFilename = data.filename || `import-engine-${Date.now()}.json`;
        if (preview) preview.textContent = JSON.stringify(ue5JsonLastResult, null, 2);
        loadUe5JsonIntoCameraEditor(ue5JsonLastResult);
        if (summary) {
            const extras = [];
            if (data.frame_count) extras.push(`视频抽帧${data.frame_count}张`);
            if (data.role_count) extras.push(`人物参考${data.role_count}个`);
            summary.textContent = `已生成：${(ue5JsonLastResult.roles || []).length}个角色，${(ue5JsonLastResult.shots || []).length}个镜头${extras.length ? `；${extras.join('，')}` : ''}。`;
        }
        if (status) status.textContent = '已生成';
        document.getElementById('btnDownloadUe5JsonDirect')?.classList.remove('hidden');
        updateInlineLiveProgress('ue5-json-direct', { stage: 'done', text: data.message || '导入引擎文件已生成', charCount: (data.raw_text || '').length });
        scheduleUe5JsonStateSave();
        autoCollapseWorkflowInput('ue5-json');
        downloadLastUe5JsonDirect();
        showToast('导入引擎文件已生成并开始下载', 'success');
    } catch (e) {
        if (status) status.textContent = '失败';
        if (summary) summary.textContent = formatActionError('导入引擎生成失败: ', e.message);
        scheduleUe5JsonStateSave();
        showToast(formatActionError('导入引擎生成失败: ', e.message), 'error');
    } finally {
        stopInlineFakeProgress('ue5-json-direct');
        resetBtn();
        updateUe5JsonActionLabels();
    }
}

async function generateUe5JsonFromPreparedProject(text, btn, status, summary, preview) {
    const res = await fetch(`/api/projects/${currentProject}/ue5-cutscene-json/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ue5_cutscene_json', prepared_text: text })
    });
    let finalData = null;
    await readNdjsonStream(res, {
        status(event) {
            if (summary) summary.textContent = event.message || '导入引擎生成中...';
            updateInlineLiveProgress('ue5-json-direct', { stage: event.stage, text: event.message || '导入引擎生成中' });
        },
        delta(event) {
            if (preview) {
                preview.textContent += event.text || '';
                preview.scrollTop = preview.scrollHeight;
            }
            updateInlineLiveProgress('ue5-json-direct', {
                stage: 'json_streaming',
                text: `模型正在输出 JSON，已收到 ${event.char_count || 0} 字`,
                charCount: event.char_count || 0
            });
        },
        done(event) {
            finalData = event;
        }
    });
    if (!finalData) throw new Error('流式响应未返回完成事件');
    const data = finalData;
    ue5JsonLastResult = data.cutscene_json || {};
    ue5JsonLastFilename = data.filename || `import-engine-${Date.now()}.json`;
    if (preview) preview.textContent = JSON.stringify(ue5JsonLastResult, null, 2);
    loadUe5JsonIntoCameraEditor(ue5JsonLastResult);
    if (summary) {
        summary.textContent = `已生成：${(ue5JsonLastResult.roles || []).length}个角色，${(ue5JsonLastResult.shots || []).length}个镜头。`;
    }
    if (status) status.textContent = '已生成';
    document.getElementById('btnDownloadUe5JsonDirect')?.classList.remove('hidden');
    updateInlineLiveProgress('ue5-json-direct', { stage: 'done', text: data.message || '导入引擎文件已生成', charCount: (data.raw_text || '').length });
    scheduleUe5JsonStateSave();
    autoCollapseWorkflowInput('ue5-json');
    downloadLastUe5JsonDirect();
    showToast('导入引擎文件已生成并开始下载', 'success');
    updateUe5JsonActionLabels();
}

function downloadLastUe5JsonDirect() {
    if (!ue5JsonLastResult) {
        showToast('还没有可下载的导入引擎文件', 'warning');
        return;
    }
    const text = JSON.stringify(ue5JsonLastResult, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ue5JsonLastFilename || `import-engine-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function triggerUe5JsonImportFile() {
    document.getElementById('ue5JsonImportInput')?.click();
}

async function importUe5JsonFile(file) {
    if (!file) return;
    try {
        const text = await file.text();
        const payload = JSON.parse(text);
        ue5JsonLastResult = normalizeUe5JsonForEditor(payload);
        ue5JsonLastFilename = file.name || `import-engine-${Date.now()}.json`;
        updateUe5JsonPreviewAfterEdit();
        loadUe5JsonIntoCameraEditor(ue5JsonLastResult);
        updateUe5JsonActionLabels();
        scheduleUe5JsonStateSave();
        autoCollapseWorkflowInput('ue5-json');
        showToast('UE JSON 已导入，可开始可视化调镜', 'success');
    } catch (e) {
        showToast('导入 JSON 失败: ' + e.message, 'error');
    }
}

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
}

function roundUe5Number(value, digits = 4) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Number(n.toFixed(digits));
}

function normalizeUe5JsonForEditor(payload) {
    const data = cloneJson(payload);
    if (!Array.isArray(data.roles)) data.roles = [];
    if (!Array.isArray(data.shots)) data.shots = [];
    data.shots.forEach((shot, index) => {
        shot.index = Number.isFinite(Number(shot.index)) ? Number(shot.index) : index;
        shot.camLengthSeconds = Math.max(0.1, Number(shot.camLengthSeconds) || 3);
        shot.talkID = Number.isFinite(Number(shot.talkID)) ? Number(shot.talkID) : -1;
        shot.talkStartSeconds = Math.max(0, Number(shot.talkStartSeconds) || 0);
        shot.talkEndSeconds = Math.max(shot.talkStartSeconds, Number(shot.talkEndSeconds) || shot.camLengthSeconds);
        if (!Array.isArray(shot.spike)) shot.spike = [];
        if (!Array.isArray(shot.camera)) shot.camera = [];
        if (!shot.camera.length) {
            shot.camera.push({
                keySeconds: 0,
                pos: { x: 67.5, y: -497.5, z: 138 },
                rot: { x: 0, y: -1.1458, z: 90 },
                fov: 54.6347
            });
        }
        shot.camera.forEach(camera => {
            camera.keySeconds = Math.max(0, Math.min(shot.camLengthSeconds, Number(camera.keySeconds) || 0));
            camera.pos = {
                x: roundUe5Number(camera.pos?.x),
                y: roundUe5Number(camera.pos?.y),
                z: roundUe5Number(camera.pos?.z)
            };
            camera.rot = {
                x: roundUe5Number(camera.rot?.x),
                y: roundUe5Number(camera.rot?.y),
                z: roundUe5Number(camera.rot?.z)
            };
            camera.fov = Math.max(5, Math.min(170, Number(camera.fov) || 54.6347));
        });
        shot.camera.sort((a, b) => (Number(a.keySeconds) || 0) - (Number(b.keySeconds) || 0));
    });
    return data;
}

function loadUe5JsonIntoCameraEditor(payload) {
    const editor = document.getElementById('ue5CameraEditor');
    const empty = document.getElementById('ue5CameraEditorEmpty');
    const status = document.getElementById('ue5CameraEditorStatus');
    if (!editor || !empty) return;
    if (!payload || !Array.isArray(payload.shots) || !payload.shots.length) {
        editor.classList.add('hidden');
        empty.classList.remove('hidden');
        if (status) status.textContent = '待载入';
        return;
    }
    ue5JsonLastResult = normalizeUe5JsonForEditor(payload);
    ue5JsonEditorState.shotIndex = Math.min(ue5JsonEditorState.shotIndex || 0, ue5JsonLastResult.shots.length - 1);
    ue5JsonEditorState.cameraKeyIndex = 0;
    editor.classList.remove('hidden');
    empty.classList.add('hidden');
    if (status) status.textContent = '可编辑';
    refreshUe5CameraSelectors();
    syncUe5CameraEditorFromSelection();
}

function getUe5RoleName(roleId) {
    const role = (ue5JsonLastResult?.roles || []).find(item => item.id === roleId || item.name === roleId);
    return role?.name || roleId || '角色';
}

function getSelectedUe5Shot() {
    const shots = ue5JsonLastResult?.shots || [];
    if (!shots.length) return null;
    ue5JsonEditorState.shotIndex = Math.max(0, Math.min(ue5JsonEditorState.shotIndex || 0, shots.length - 1));
    return shots[ue5JsonEditorState.shotIndex];
}

function getSelectedUe5Camera() {
    const shot = getSelectedUe5Shot();
    if (!shot) return null;
    if (!Array.isArray(shot.camera) || !shot.camera.length) shot.camera = normalizeUe5JsonForEditor({ shots: [shot] }).shots[0].camera;
    ue5JsonEditorState.cameraKeyIndex = Math.max(0, Math.min(ue5JsonEditorState.cameraKeyIndex || 0, shot.camera.length - 1));
    return shot.camera[ue5JsonEditorState.cameraKeyIndex];
}

function refreshUe5CameraSelectors() {
    const shotSelect = document.getElementById('ue5ShotSelect');
    const keySelect = document.getElementById('ue5CameraKeySelect');
    const shots = ue5JsonLastResult?.shots || [];
    if (shotSelect) {
        shotSelect.innerHTML = shots.map((shot, index) => {
            const label = `镜头 ${index + 1} · ${roundUe5Number(shot.camLengthSeconds || 0, 2)}s`;
            return `<option value="${index}">${escHtml(label)}</option>`;
        }).join('');
        shotSelect.value = String(ue5JsonEditorState.shotIndex || 0);
    }
    const shot = getSelectedUe5Shot();
    const cameras = shot?.camera || [];
    if (keySelect) {
        keySelect.innerHTML = cameras.map((camera, index) => {
            const label = `Key ${index + 1} · ${roundUe5Number(camera.keySeconds || 0, 2)}s`;
            return `<option value="${index}">${escHtml(label)}</option>`;
        }).join('');
        keySelect.value = String(ue5JsonEditorState.cameraKeyIndex || 0);
    }
}

function onUe5ShotSelectionChange() {
    const shotSelect = document.getElementById('ue5ShotSelect');
    ue5JsonEditorState.shotIndex = Number(shotSelect?.value || 0);
    ue5JsonEditorState.cameraKeyIndex = 0;
    refreshUe5CameraSelectors();
    syncUe5CameraEditorFromSelection();
}

function setUe5InputValue(id, value, digits = 4) {
    const el = document.getElementById(id);
    if (el) el.value = Number.isFinite(Number(value)) ? String(roundUe5Number(value, digits)) : '';
}

function syncUe5CameraEditorFromSelection() {
    if (!ue5JsonLastResult) return;
    const keySelect = document.getElementById('ue5CameraKeySelect');
    if (keySelect) ue5JsonEditorState.cameraKeyIndex = Number(keySelect.value || 0);
    const shot = getSelectedUe5Shot();
    const camera = getSelectedUe5Camera();
    if (!shot || !camera) return;
    ue5JsonEditorState.syncing = true;
    setUe5InputValue('ue5ShotCamLength', shot.camLengthSeconds, 2);
    setUe5InputValue('ue5ShotTalkID', shot.talkID, 0);
    setUe5InputValue('ue5ShotTalkStart', shot.talkStartSeconds, 2);
    setUe5InputValue('ue5ShotTalkEnd', shot.talkEndSeconds, 2);
    setUe5InputValue('ue5CameraKeySeconds', camera.keySeconds, 2);
    setUe5InputValue('ue5CameraPosX', camera.pos?.x);
    setUe5InputValue('ue5CameraPosY', camera.pos?.y);
    setUe5InputValue('ue5CameraPosZ', camera.pos?.z);
    setUe5InputValue('ue5CameraRotX', camera.rot?.x);
    setUe5InputValue('ue5CameraRotY', camera.rot?.y);
    setUe5InputValue('ue5CameraRotZ', camera.rot?.z);
    setUe5InputValue('ue5CameraFov', camera.fov, 2);
    renderUe5SpikeEditor();
    ue5JsonEditorState.syncing = false;
    scheduleUe5JsonStateSave();
}

function readNumberInput(id, fallback = 0) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : fallback;
}

function applyUe5CameraEditorChanges() {
    if (ue5JsonEditorState.syncing || !ue5JsonLastResult) return;
    const shot = getSelectedUe5Shot();
    const camera = getSelectedUe5Camera();
    if (!shot || !camera) return;
    shot.camLengthSeconds = Math.max(0.1, readNumberInput('ue5ShotCamLength', shot.camLengthSeconds || 3));
    shot.talkID = Math.round(readNumberInput('ue5ShotTalkID', shot.talkID || -1));
    shot.talkStartSeconds = Math.max(0, readNumberInput('ue5ShotTalkStart', shot.talkStartSeconds || 0));
    shot.talkEndSeconds = Math.max(shot.talkStartSeconds, readNumberInput('ue5ShotTalkEnd', shot.talkEndSeconds || shot.camLengthSeconds));
    camera.keySeconds = Math.max(0, Math.min(shot.camLengthSeconds, readNumberInput('ue5CameraKeySeconds', camera.keySeconds || 0)));
    camera.pos = {
        x: roundUe5Number(readNumberInput('ue5CameraPosX', camera.pos?.x || 0)),
        y: roundUe5Number(readNumberInput('ue5CameraPosY', camera.pos?.y || 0)),
        z: roundUe5Number(readNumberInput('ue5CameraPosZ', camera.pos?.z || 0))
    };
    camera.rot = {
        x: roundUe5Number(readNumberInput('ue5CameraRotX', camera.rot?.x || 0)),
        y: roundUe5Number(readNumberInput('ue5CameraRotY', camera.rot?.y || 0)),
        z: roundUe5Number(readNumberInput('ue5CameraRotZ', camera.rot?.z || 0))
    };
    camera.fov = Math.max(5, Math.min(170, roundUe5Number(readNumberInput('ue5CameraFov', camera.fov || 54.6347), 2)));
    shot.camera.sort((a, b) => (Number(a.keySeconds) || 0) - (Number(b.keySeconds) || 0));
    ue5JsonEditorState.cameraKeyIndex = shot.camera.indexOf(camera);
    updateUe5JsonPreviewAfterEdit();
    refreshUe5CameraSelectors();
}

function updateUe5JsonPreviewAfterEdit() {
    const preview = document.getElementById('ue5JsonPreview');
    const status = document.getElementById('ue5JsonStatus');
    const summary = document.getElementById('ue5JsonSummary');
    if (preview && ue5JsonLastResult) preview.textContent = JSON.stringify(ue5JsonLastResult, null, 2);
    if (status && ue5JsonLastResult) status.textContent = '已编辑';
    if (summary && ue5JsonLastResult) {
        summary.textContent = `当前JSON：${(ue5JsonLastResult.roles || []).length}个角色，${(ue5JsonLastResult.shots || []).length}个镜头。`;
    }
    document.getElementById('btnDownloadUe5JsonDirect')?.classList.remove('hidden');
    updateUe5JsonActionLabels();
    scheduleUe5JsonStateSave();
}

function addUe5CameraKeyframe() {
    const shot = getSelectedUe5Shot();
    const camera = getSelectedUe5Camera();
    if (!shot || !camera) return;
    const clone = cloneJson(camera);
    clone.keySeconds = Math.min(shot.camLengthSeconds, roundUe5Number((Number(camera.keySeconds) || 0) + 0.5, 2));
    shot.camera.push(clone);
    shot.camera.sort((a, b) => (Number(a.keySeconds) || 0) - (Number(b.keySeconds) || 0));
    ue5JsonEditorState.cameraKeyIndex = shot.camera.indexOf(clone);
    refreshUe5CameraSelectors();
    syncUe5CameraEditorFromSelection();
    updateUe5JsonPreviewAfterEdit();
}

function deleteUe5CameraKeyframe() {
    const shot = getSelectedUe5Shot();
    if (!shot?.camera?.length) return;
    if (shot.camera.length <= 1) {
        showToast('每个镜头至少需要保留一个相机关键帧', 'warning');
        return;
    }
    shot.camera.splice(ue5JsonEditorState.cameraKeyIndex, 1);
    ue5JsonEditorState.cameraKeyIndex = Math.max(0, ue5JsonEditorState.cameraKeyIndex - 1);
    refreshUe5CameraSelectors();
    syncUe5CameraEditorFromSelection();
    updateUe5JsonPreviewAfterEdit();
}

function renderUe5SpikeEditor() {
    const wrap = document.getElementById('ue5SpikeEditor');
    const shot = getSelectedUe5Shot();
    if (!wrap || !shot) return;
    const spike = Array.isArray(shot.spike) ? shot.spike : [];
    if (!spike.length) {
        wrap.innerHTML = '<div class="empty-state"><p>当前镜头没有 spike 角色站位。</p></div>';
        return;
    }
    wrap.innerHTML = spike.map((item, index) => `
        <div class="ue5-spike-row">
            <div class="ue5-spike-row-title">
                <span>${escHtml(getUe5RoleName(item.role))}</span>
                <small>${escHtml(item.role || `role-${index + 1}`)}</small>
            </div>
            <div class="ue5-spike-grid">
                <label>Pos X<input type="number" step="1" value="${escAttr(roundUe5Number(item.pos?.x || 0))}" onchange="updateUe5SpikeValue(${index}, 'pos', 'x', this.value)"></label>
                <label>Pos Y<input type="number" step="1" value="${escAttr(roundUe5Number(item.pos?.y || 0))}" onchange="updateUe5SpikeValue(${index}, 'pos', 'y', this.value)"></label>
                <label>Pos Z<input type="number" step="1" value="${escAttr(roundUe5Number(item.pos?.z || 0))}" onchange="updateUe5SpikeValue(${index}, 'pos', 'z', this.value)"></label>
                <label>Rot X<input type="number" step="0.1" value="${escAttr(roundUe5Number(item.rot?.x || 0))}" onchange="updateUe5SpikeValue(${index}, 'rot', 'x', this.value)"></label>
                <label>Rot Y<input type="number" step="0.1" value="${escAttr(roundUe5Number(item.rot?.y || 0))}" onchange="updateUe5SpikeValue(${index}, 'rot', 'y', this.value)"></label>
                <label>Rot Z<input type="number" step="0.1" value="${escAttr(roundUe5Number(item.rot?.z || 0))}" onchange="updateUe5SpikeValue(${index}, 'rot', 'z', this.value)"></label>
            </div>
        </div>
    `).join('');
}

function updateUe5SpikeValue(index, group, axis, value) {
    const shot = getSelectedUe5Shot();
    const item = shot?.spike?.[index];
    if (!item || !['pos', 'rot'].includes(group) || !['x', 'y', 'z'].includes(axis)) return;
    if (!item[group]) item[group] = {};
    item[group][axis] = roundUe5Number(value);
    updateUe5JsonPreviewAfterEdit();
}

async function importSelectedUe5ShotToReference3D() {
    const shot = getSelectedUe5Shot();
    const camera = getSelectedUe5Camera();
    if (!shot || !camera) {
        showToast('请先生成或导入 UE JSON', 'warning');
        return;
    }
    applyUe5CameraEditorChanges();
    const control = {
        source: 'ue5-json',
        coordinateSpace: 'ue5',
        ue5Link: {
            shotIndex: ue5JsonEditorState.shotIndex,
            cameraKeyIndex: ue5JsonEditorState.cameraKeyIndex
        },
        characters: (shot.spike || []).map((item, index) => ({
            name: getUe5RoleName(item.role) || `角色 ${index + 1}`,
            role: item.role || '',
            position: item.pos || {},
            rotation: item.rot || {}
        })),
        camera: {
            position: camera.pos || {},
            rotation: camera.rot || {},
            fov: camera.fov
        }
    };
    await importControlDataToReference3D(control);
    showToast('已把当前 UE 镜头导入 3D 截图模式，可直接验证和调节摄影机', 'success');
}

function clampActiveSegmentEditIndex(segments = currentSegments) {
    if (!segments.length) {
        activeSegmentEditIndex = 0;
        return 0;
    }
    activeSegmentEditIndex = Math.max(0, Math.min(activeSegmentEditIndex, segments.length - 1));
    return activeSegmentEditIndex;
}

function getSegmentStatusMeta(seg) {
    const segStatus = seg?._genStatus || statusToGenStatus(seg?.status);
    const statusLabel = {idle:'可编辑', generating:'生成中...', completed:'已完成', failed:'失败'}[segStatus] || '可编辑';
    const statusClass = {idle:'editing', generating:'generating', completed:'completed', failed:'error'}[segStatus] || 'editing';
    return { segStatus, statusLabel, statusClass };
}

function cacheActiveSegmentEditorState(index = activeSegmentEditIndex) {
    const seg = currentSegments[index];
    if (!seg) return;

    const editor = document.getElementById(`segEditor-${index}`);
    if (editor) {
        const prompt = readMentionEditorValue(editor);
        if (prompt.trim()) {
            seg.prompt = prompt;
            seg.prompt_text = prompt;
        }
    }

    const modeEl = document.getElementById(`segMode-${index}`);
    const ratioEl = document.getElementById(`segRatio-${index}`);
    const durationEl = document.getElementById(`segDuration-${index}`);
    if (modeEl) seg._mode = modeEl.value || seg._mode;
    if (ratioEl) seg._ratio = ratioEl.value || seg._ratio;
    if (durationEl) seg.duration = normalizeVideoDuration(durationEl.value || seg.duration || 5);

    const storyboardPromptEl = document.getElementById(`storyboardPrompt-${index}`);
    if (storyboardPromptEl) seg.storyboard_prompt = storyboardPromptEl.value || '';
    const storyboardEditEl = document.getElementById(`storyboardEditPrompt-${index}`);
    if (storyboardEditEl) seg._storyboardEditPrompt = storyboardEditEl.value || '';
    const videoPromptEl = document.getElementById(`videoPrompt-${index}`);
    if (videoPromptEl) {
        const videoPrompt = videoPromptEl.value || '';
        if (videoPrompt.trim()) {
            seg.prompt = videoPrompt;
            seg.prompt_text = videoPrompt;
            seg._videoPromptDirty = true;
        }
    }
}

function selectSegmentForEditing(index) {
    if (!currentSegments.length) return;
    cacheActiveSegmentEditorState();
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    renderSegments(currentSegments);
}

function renderSegmentTimelineItem(seg, i, activeIndex) {
    normalizeSegmentState(seg);
    const { segStatus, statusLabel, statusClass } = getSegmentStatusMeta(seg);
    const duration = seg.duration || 5;
    const promptPreview = (seg.prompt || seg.prompt_text || '').replace(/\s+/g, ' ').trim();
    const scene = seg.scene || '';
    const progressPercent = Number.isFinite(seg._progressPercent) ? Math.min(seg._progressPercent, 100) : (segStatus === 'completed' ? 100 : (segStatus === 'generating' ? 8 : 0));
    const progressText = segStatus === 'generating' ? `${Math.max(0, Math.floor(progressPercent))}%` : '';
    const videoSrc = seg._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg._videoUrl || '');
    const thumbHtml = seg.storyboard_image_path
        ? `<img src="/${escAttr(seg.storyboard_image_path)}" alt="片段${i + 1}">`
        : (videoSrc
            ? `<video src="${escAttr(videoSrc)}" muted preload="metadata"></video>`
            : `<span>${i + 1}</span>`);

    return `
        <button type="button"
            class="segment-timeline-item ${i === activeIndex ? 'active' : ''}"
            id="segmentTimelineItem-${i}"
            data-segment-index="${i}"
            onclick="selectSegmentForEditing(${i})">
            <span class="segment-timeline-thumb">${thumbHtml}</span>
            <span class="segment-timeline-body">
                <span class="segment-timeline-title">片段 ${i + 1}</span>
                <span class="segment-timeline-desc">${escHtml(promptPreview || scene || '空片段')}</span>
                <span class="segment-timeline-meta-row">
                    <span>${duration}秒</span>
                    ${progressText ? `<span id="segmentTimelineProgressText-${i}" class="segment-timeline-progress-text">${progressText}</span>` : ''}
                    <span id="segmentTimelineStatus-${i}" class="segment-status ${statusClass}">${statusLabel}</span>
                </span>
            </span>
        </button>`;
}

function getSegmentStoryTitle(seg, index) {
    const text = (seg?.prompt || seg?.prompt_text || '').replace(/\r/g, '').trim();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const firstDialogue = lines.find(line => !/^舞台指示|^情景描述/i.test(line)) || lines[0] || '';
    const compact = firstDialogue
        .replace(/\t+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[^：:]{1,8}[：:]\s*/, '')
        .trim();
    return compact ? compact.slice(0, 18) : `片段 ${index + 1}`;
}

function getSegmentSourceText(seg) {
    return (seg?._original || seg?.source_script || seg?.prompt_text || seg?.prompt || '').trim();
}

function isLegacyStoryboardPrompt(prompt = '') {
    const value = String(prompt || '').trim();
    return /原始台本依据|当前镜头内容|逐格镜头要求|分镜分格要求|固定视觉风格：|角色锁：人物：/.test(value)
        || /^(\d+\s*:\s*\d+|16:9|21:9)画幅[，,]\s*生成单张黑白铅笔动态分镜表/.test(value)
        || /^生成单张黑白铅笔动态分镜表/.test(value);
}

function isTargetStoryboardPromptFormat(prompt = '') {
    const value = String(prompt || '').trim();
    return /^(参考图对应：[^。]+。)?生成单张(四格|六格|九格|十二格)动态分镜表/.test(value)
        && !isLegacyStoryboardPrompt(value);
}

function getStoryboardPromptFormatRetryInstruction() {
    return [
        '上一版输出仍然像旧网页模板，必须重写为用户指定的新 Image Prompt 格式。',
        '开头必须是“参考图对应：...。生成单张六格动态分镜表...”或“生成单张六格动态分镜表...”。',
        '固定风格必须并入开头长句，禁止出现“固定视觉风格：”。',
        '必须写“根据以下剧情转化镜头，不复述台词：...”并用视觉剧情概括，不要粘贴原台词。',
        '逐格部分只用“01，...。02，...。03，...。04，...。05，...。06，...。”。',
        '禁止出现：原始台本依据、当前镜头内容、逐格镜头要求、分镜分格要求、固定视觉风格。'
    ].join('\n');
}

function isGeneratedVideoPromptText(text = '', seg = null) {
    const value = String(text || '').trim();
    if (!value) return false;
    const source = (seg?._original || seg?.source_script || '').trim();
    if (source && value === source) return false;
    return /Video Prompt|Seedance|视频提示词|15秒|镜头|运镜|口型|无字幕|分镜图参考|构图锚点/i.test(value);
}

function getSegmentVideoPrompt(seg) {
    if (!seg) return '';
    const explicit = (seg.video_prompt_text || seg.video_prompt || '').trim();
    if (explicit) return explicit;
    const value = (seg.prompt || seg.prompt_text || '').trim();
    if (seg._videoPromptDirty || isGeneratedVideoPromptText(value, seg)) return value;
    return '';
}

function renderPipelineStatusPill(state, text) {
    return `<span class="pipeline-status ${escAttr(state)}">${escHtml(text)}</span>`;
}

function getStoryboardPromptStatus(seg) {
    if (seg?.storyboard_prompt) return renderPipelineStatusPill('ready', 'Prompt 已就绪');
    if (seg?.storyboard_status === 'generating') return renderPipelineStatusPill('running', '正在生成');
    if (seg?.storyboard_status === 'legacy_prompt') return renderPipelineStatusPill('failed', '旧格式待重生');
    if (seg?.storyboard_status === 'failed') return renderPipelineStatusPill('failed', '生成失败');
    return renderPipelineStatusPill('idle', '等待生成');
}

function getStoryboardImageStatus(seg) {
    if (seg?.storyboard_status === 'generating') return renderPipelineStatusPill('running', '正在出图');
    if (seg?.storyboard_image_path) return renderPipelineStatusPill('ready', '图片就绪');
    if (seg?.storyboard_status === 'failed') return renderPipelineStatusPill('failed', '出图失败');
    if (seg?.storyboard_prompt) return renderPipelineStatusPill('idle', '可生成');
    return renderPipelineStatusPill('idle', '等待 Prompt');
}

function getVideoStageStatus(seg, segStatus, videoSrc) {
    if (segStatus === 'generating') return renderPipelineStatusPill('running', '视频生成中');
    if (videoSrc) return renderPipelineStatusPill('ready', '视频完成');
    if (segStatus === 'failed') return renderPipelineStatusPill('failed', '视频失败');
    if (seg?.storyboard_image_path) return renderPipelineStatusPill('idle', '可生成');
    return renderPipelineStatusPill('idle', '等待分镜图');
}

function getVideoPromptStatus(seg) {
    if (seg?._videoPromptStatus === 'generating') return renderPipelineStatusPill('running', '正在生成');
    if (getSegmentVideoPrompt(seg)) return renderPipelineStatusPill('ready', '已生成');
    if (seg?._videoPromptStatus === 'failed') return renderPipelineStatusPill('failed', '生成失败');
    if (seg?.storyboard_prompt && seg?.storyboard_image_path) return renderPipelineStatusPill('idle', '可生成');
    return renderPipelineStatusPill('idle', '等待分镜图');
}

function getSegmentFlowState(seg = {}) {
    const videoSrc = seg._localVideoPath || seg._videoUrl || seg.video_url || seg.local_video_path || '';
    return {
        source: !!getSegmentSourceText(seg),
        imagePrompt: !!seg.storyboard_prompt,
        storyboardImage: !!seg.storyboard_image_path,
        videoPrompt: !!getSegmentVideoPrompt(seg),
        video: !!videoSrc || seg.status === 'completed',
        promptRunning: seg.storyboard_status === 'generating',
        videoPromptRunning: seg._videoPromptStatus === 'generating',
        videoRunning: (seg._genStatus || statusToGenStatus(seg.status)) === 'generating'
    };
}

function renderFlowStepNode(number, title, status, active) {
    const statusText = status === 'done' ? '已完成' : (status === 'running' ? '进行中' : '等待');
    return `
        <span class="flow-context-node ${escAttr(status)} ${active ? 'active' : ''}">
            <span class="flow-context-no">${number}</span>
            <span class="flow-context-copy">
                <strong>${escHtml(title)}</strong>
                <small>${statusText}</small>
            </span>
        </span>`;
}

function renderFlowContext(stage, segments = []) {
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const seg = segments[activeIndex] || {};
    const state = getSegmentFlowState(seg);
    const step1Status = state.storyboardImage ? 'done' : (state.promptRunning ? 'running' : (state.imagePrompt ? 'running' : 'wait'));
    const step2Status = state.videoPrompt ? 'done' : (state.videoPromptRunning ? 'running' : (state.storyboardImage ? 'running' : 'wait'));
    const step3Status = state.video ? 'done' : (state.videoRunning ? 'running' : (state.videoPrompt ? 'running' : 'wait'));
    const config = {
        script: {
            eyebrow: '01',
            title: '分镜提示 / 分镜图',
            input: '输入：台本 / 素材',
            output: '输出：原台词 / 提示 / 图',
            action: '下一步：视频提示'
        },
        image: {
            eyebrow: '02',
            title: '视频提示',
            input: '输入：分镜提示 / 分镜图',
            output: '输出：单段视频提示',
            action: '下一步：生成视频'
        },
        video: {
            eyebrow: '02',
            title: '生成视频',
            input: '输入：分镜图 / 视频提示',
            output: '输出：当前视频',
            action: '完成后进入编辑'
        }
    }[stage] || {};
    return `
        <div class="flow-context-card flow-context-${escAttr(stage)}">
            <div class="flow-context-current">
                <span class="eyebrow">${escHtml(config.eyebrow || '')}</span>
                <h3>${escHtml(config.title || '')}</h3>
                <div class="flow-context-facts">
                    <span>${escHtml(config.input || '')}</span>
                    <span>${escHtml(config.output || '')}</span>
                    <span>${escHtml(config.action || '')}</span>
                </div>
            </div>
            <div class="flow-context-track" aria-label="当前片段流程状态">
                ${renderFlowStepNode('01', '台本 / 图', step1Status, stage === 'script')}
                ${renderFlowStepNode('02', '视频提示', step2Status, stage === 'image')}
                ${renderFlowStepNode('03', '视频', step3Status, stage === 'video')}
            </div>
        </div>`;
}

function renderFlowSidebarChecklist(seg = {}) {
    const state = getSegmentFlowState(seg);
    const items = [
        ['原台词', state.source],
        ['分镜提示', state.imagePrompt],
        ['分镜图', state.storyboardImage],
        ['视频提示', state.videoPrompt],
        ['视频', state.video]
    ];
    return `
        <div class="flow-sidebar-checklist">
            <strong>当前片段</strong>
            ${items.map(([label, done]) => `<span class="${done ? 'done' : ''}"><i>${done ? '✓' : '○'}</i>${escHtml(label)}</span>`).join('')}
        </div>`;
}

function getSegmentProgressMarkup(seg, i, segStatus, progressPercent, progressText) {
    if (!(segStatus === 'generating' || segStatus === 'completed' || segStatus === 'failed')) return '';
    return `
        <div class="segment-inline-progress ${segStatus}">
            <div class="segment-progress-info">
                <span id="segProgressText-${i}">${escHtml(progressText || '')}</span>
                <span id="segProgressPercent-${i}">${Math.min(progressPercent, 100)}%</span>
            </div>
            <div class="segment-progress-track">
                <div id="segProgressBar-${i}" class="segment-progress-bar" style="width:${Math.min(progressPercent, 100)}%"></div>
            </div>
        </div>`;
}

async function copySegmentImagePrompt(index) {
    const seg = currentSegments[index];
    const text = (seg?.storyboard_prompt || '').trim();
    if (!text) {
        showToast(`片段 ${index + 1} 还没有 Image Prompt`, 'warning');
        return;
    }
    await copyText(text);
}

function openPromptSegmentInFlow(index, step = 'prompt') {
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    focusProductionFlowStep(step === 'prompt' ? 'script' : step);
}

function selectStoryboardImageSegment(index) {
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    activeProductionFlowStep = 'script';
    renderSegments(currentSegments);
}

function selectVideoPromptSegment(index) {
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    activeProductionFlowStep = 'image';
    renderSegments(currentSegments);
}

function selectVideoGenerationSegment(index) {
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    activeProductionFlowStep = 'video';
    renderSegments(currentSegments);
}

function selectScriptPromptSegment(index) {
    activeSegmentEditIndex = Math.max(0, Math.min(Number(index) || 0, currentSegments.length - 1));
    activeProductionFlowStep = 'script';
    renderSegments(currentSegments);
}

function renderScriptPromptOverview(segments) {
    segments.forEach(normalizeSegmentState);
    const ready = segments.filter(seg => seg?.storyboard_prompt).length;
    const imageReady = segments.filter(seg => seg?.storyboard_image_path).length;
    const generating = segments.some(seg => seg?.storyboard_status === 'generating');
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const activeSeg = segments[activeIndex];
    normalizeSegmentState(activeSeg);
    const activeTitle = getSegmentStoryTitle(activeSeg, activeIndex);
    const activePrompt = (activeSeg.storyboard_prompt || '').trim();
    const activeImagePath = activeSeg.storyboard_image_path || '';
    const activeImageLoading = activeSeg.storyboard_status === 'generating';
    const activeSourceText = getSegmentSourceText(activeSeg);
    const activeStatus = activePrompt
        ? renderPipelineStatusPill('ready', '已生成')
        : (activeSeg.storyboard_status === 'generating'
            ? renderPipelineStatusPill('running', '生成中')
            : renderPipelineStatusPill('idle', '待生成'));
    const activeImagePreview = activeImagePath
        ? `<img src="/${escAttr(activeImagePath)}" alt="片段 ${activeIndex + 1} 分镜图">`
        : `<div class="storyboard-image-empty">
                <strong>${activePrompt ? '待出图' : '待生成'}</strong>
                <span>${activePrompt ? '生成后显示分镜图。' : '先生成分镜提示。'}</span>
           </div>`;
    const activeStoryboardEditTools = activeImagePath ? `
        <div class="storyboard-image-edit-tools">
            <div class="storyboard-image-edit-path">当前图会作为视频首帧参考。</div>
            <label for="storyboardEditPrompt-${activeIndex}">修改提示</label>
            <textarea class="storyboard-prompt-editor storyboard-image-edit-editor" id="storyboardEditPrompt-${activeIndex}" rows="5" placeholder="例如：第3格改成近景眼神特写" oninput="currentSegments[${activeIndex}]._storyboardEditPrompt = this.value">${escHtml(activeSeg._storyboardEditPrompt || '')}</textarea>
            <div class="storyboard-image-edit-actions">
                <button type="button" class="btn btn-sm btn-primary" onclick="editStoryboardImage(${activeIndex})">重生图</button>
                <a class="btn btn-sm btn-secondary" href="/${escAttr(activeImagePath)}" target="_blank">放大</a>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteStoryboardFrame(${activeIndex}, 'start')">删除</button>
            </div>
        </div>` : '';
    const renderCard = (seg, i) => {
        normalizeSegmentState(seg);
        const duration = seg.duration || 15;
        const title = getSegmentStoryTitle(seg, i);
        const prompt = (seg.storyboard_prompt || '').trim();
        const imagePath = seg.storyboard_image_path || '';
        const status = prompt
            ? renderPipelineStatusPill('ready', '已生成')
            : (seg.storyboard_status === 'generating'
                ? renderPipelineStatusPill('running', '生成中')
                : renderPipelineStatusPill('idle', '待生成'));
        const imageStatus = imagePath
            ? renderPipelineStatusPill('ready', '分镜图')
            : (seg.storyboard_status === 'generating'
                ? renderPipelineStatusPill('running', '出图中')
                : renderPipelineStatusPill('idle', prompt ? '可出图' : '等提示'));
        const thumb = imagePath
            ? `<img src="/${escAttr(imagePath)}" alt="片段 ${i + 1} 分镜图">`
            : `<span>${i + 1}</span>`;
        return `
            <article class="script-prompt-card ${i === activeIndex ? 'active' : ''}" onclick="selectScriptPromptSegment(${i})">
                <div class="script-prompt-card-head">
                    <span class="script-prompt-card-thumb">${thumb}</span>
                    <div>
                        <span class="script-prompt-index">片段 ${i + 1}</span>
                        <strong>${escHtml(title)}</strong>
                    </div>
                    <span class="script-prompt-card-status">${status}${imageStatus}</span>
                </div>
                <div class="script-prompt-meta">
                    <span>${duration}秒</span>
                    <span>${prompt ? `${prompt.length}字提示` : '无提示'}</span>
                    <span>${imagePath ? '已有分镜图' : '未出图'}</span>
                </div>
            </article>`;
    };
    return `
        <div class="script-prompt-page">
            ${renderFlowContext('script', segments)}
            <div class="script-prompt-page-head">
                <div>
                    <span class="eyebrow">01 台本</span>
                    <h3>分镜提示 / 分镜图</h3>
                    <p>片段 ${activeIndex + 1} · ${activeSeg.duration || 15}秒</p>
                </div>
                <div class="script-prompt-page-actions">
                    <span class="badge">${ready}/${segments.length} 提示</span>
                    <span class="badge">${imageReady}/${segments.length} 图</span>
                    <button type="button" class="btn btn-sm btn-primary script-prompt-generate-all" onclick="generateAllStoryboardPrompts()">全部生成提示</button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="generateAllStoryboardImages()" ${ready ? '' : 'disabled'}>全部出图</button>
                </div>
            </div>
            ${generating ? '<div class="script-prompt-loading">正在生成，稍后自动刷新。</div>' : ''}
            <section class="script-prompt-feature">
                <div class="script-prompt-feature-head">
                    <div>
                        <span class="script-prompt-index">片段 ${activeIndex + 1}</span>
                        <h3>${escHtml(activeTitle)}</h3>
                        <p>${activeSeg.duration || 15}秒 · 台本 → 提示 → 图</p>
                    </div>
                    <div class="script-prompt-feature-actions">
                        ${activeStatus}
                        ${getStoryboardImageStatus(activeSeg)}
                        <button type="button" class="btn btn-sm btn-secondary" onclick="copySegmentImagePrompt(${activeIndex})" ${activePrompt ? '' : 'disabled'}>复制</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="generateStoryboardPrompt(${activeIndex})">重生提示</button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="regenerateStoryboardImage(${activeIndex})" ${activePrompt || activeSeg.id ? '' : 'disabled'}>${activeImagePath ? '重生图' : '出图'}</button>
                    </div>
                </div>
                <div class="step-transfer-strip">
                    <span class="done">台本</span>
                    <i></i>
                    <span class="${activePrompt ? 'done' : 'active'}">提示</span>
                    <i></i>
                    <span class="${activeImagePath ? 'done' : (activePrompt ? 'active' : '')}">图</span>
                    <i></i>
                    <span>视频提示</span>
                </div>
                <div class="script-prompt-feature-body script-prompt-merged-body">
                    <div class="script-prompt-merged-left">
                        <div class="script-prompt-original script-prompt-original-feature">
                            <strong>片段原台词</strong>
                            <span>${escHtml(activeSourceText || '暂无原台词')}</span>
                        </div>
                        <div class="script-prompt-editor-wrap">
                            <div class="script-prompt-editor-head">
                                <strong>分镜提示</strong>
                                <span>${activePrompt ? `${activePrompt.length}字` : '未生成'}</span>
                            </div>
                            <textarea class="script-prompt-large-editor" id="storyboardPrompt-${activeIndex}" rows="18" placeholder="这里显示当前片段的分镜提示。" onblur="saveStoryboardPromptEdit(${activeIndex})">${escHtml(activePrompt)}</textarea>
                        </div>
                    </div>
                    <div class="storyboard-image-preview-panel ${activeImageLoading ? 'is-loading' : ''}">
                        <div class="storyboard-image-panel-head">
<strong>分镜图</strong>
                            <span>${activeImagePath ? '图片已生成' : (activeImageLoading ? '生成中' : '等待生成')}</span>
                        </div>
                        ${activeImageLoading ? `
                            <div class="storyboard-image-loading">
                                <span class="loading-spinner"></span>
                                <div><strong>正在生成分镜图</strong><small>你可以切换到其他片段继续检查 Prompt。</small></div>
                            </div>` : ''}
                        <div class="storyboard-image-preview-frame">
                            ${activeImagePreview}
                        </div>
                        <div class="script-prompt-actions">
                            <button type="button" class="btn btn-sm btn-primary" onclick="regenerateStoryboardImage(${activeIndex})" ${activePrompt || activeSeg.id ? '' : 'disabled'}>${activeImagePath ? '重生图' : '出图'}</button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="regenerateStoryboardImage(${activeIndex}, { regeneratePrompt: true })">提示+图</button>
                        </div>
                        ${activeStoryboardEditTools}
                    </div>
                </div>
            </section>
            <div class="script-prompt-grid">
                ${segments.map(renderCard).join('')}
            </div>
        </div>`;
}

function renderStoryboardImageSidebarItem(seg, i, activeIndex) {
    normalizeSegmentState(seg);
    const title = getSegmentStoryTitle(seg, i);
    const imageReady = !!seg.storyboard_image_path;
    const promptReady = !!seg.storyboard_prompt;
    const generating = seg.storyboard_status === 'generating';
    const statusText = generating ? '生成中' : (imageReady ? '已出图' : (promptReady ? '可生成' : '缺 Prompt'));
    const statusClass = generating ? 'running' : (imageReady ? 'ready' : (promptReady ? 'idle' : 'failed'));
    const thumb = imageReady
        ? `<img src="/${escAttr(seg.storyboard_image_path)}" alt="分段 ${i + 1}">`
        : `<span>${i + 1}</span>`;
    return `
        <button type="button" class="storyboard-image-nav-item ${i === activeIndex ? 'active' : ''}" onclick="selectStoryboardImageSegment(${i})">
            <span class="storyboard-image-nav-thumb">${thumb}</span>
            <span class="storyboard-image-nav-copy">
                <strong>分段 ${i + 1}</strong>
                <small>${escHtml(title)}</small>
            </span>
            <span class="storyboard-image-nav-status ${statusClass}">${statusText}</span>
        </button>`;
}

function renderVideoPromptSidebarItem(seg, i, activeIndex) {
    normalizeSegmentState(seg);
    const title = getSegmentStoryTitle(seg, i);
    const imageReady = !!seg.storyboard_image_path;
    const promptReady = !!getSegmentVideoPrompt(seg);
    const running = seg._videoPromptStatus === 'generating';
    const failed = seg._videoPromptStatus === 'failed';
    const statusClass = failed ? 'failed' : (running ? 'running' : (promptReady ? 'ready' : ''));
    const statusText = failed ? '失败' : (running ? '生成中' : (promptReady ? '已生成' : (imageReady ? '可生成' : '等分镜图')));
    const thumb = imageReady
        ? `<img src="/${escAttr(seg.storyboard_image_path)}" alt="分段 ${i + 1}">`
        : `<span>${i + 1}</span>`;
    return `
        <button type="button" class="storyboard-image-nav-item ${i === activeIndex ? 'active' : ''}" onclick="selectVideoPromptSegment(${i})">
            <span class="storyboard-image-nav-thumb">${thumb}</span>
            <span class="storyboard-image-nav-copy">
                <strong>分段 ${i + 1}</strong>
                <small>${escHtml(title)}</small>
            </span>
            <span class="storyboard-image-nav-status ${statusClass}">${statusText}</span>
        </button>`;
}

function renderStoryboardImagePage(segments) {
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const seg = segments[activeIndex];
    normalizeSegmentState(seg);
    const prompt = seg.storyboard_prompt || '';
    const imagePath = seg.storyboard_image_path || '';
    const title = getSegmentStoryTitle(seg, activeIndex);
    const sourceText = getSegmentSourceText(seg);
    const duration = seg.duration || 15;
    const loading = seg.storyboard_status === 'generating';
    const imageStatus = getStoryboardImageStatus(seg);
    const imagePreview = imagePath
        ? `<img src="/${escAttr(imagePath)}" alt="分段 ${activeIndex + 1} 分镜图">`
        : `<div class="storyboard-image-empty">
                <strong>${prompt ? '等待生成分镜图' : '等待 Image Prompt'}</strong>
                <span>${prompt ? '点击右上按钮后，生成结果会显示在这里。' : '先回到第 1 页生成分段 Image Prompt。'}</span>
           </div>`;
    const storyboardEditTools = imagePath ? `
        <div class="storyboard-image-edit-tools">
            <div class="storyboard-image-edit-path">当前分镜图：${escHtml(imagePath)}。生成视频时会作为核心参考图输入。</div>
            <label for="storyboardEditPrompt-${activeIndex}">编辑提示词</label>
            <textarea class="storyboard-prompt-editor storyboard-image-edit-editor" id="storyboardEditPrompt-${activeIndex}" rows="5" placeholder="输入要修改的内容，例如：第3格改成近景眼神特写；保持其他格子不变" oninput="currentSegments[${activeIndex}]._storyboardEditPrompt = this.value">${escHtml(seg._storyboardEditPrompt || '')}</textarea>
            <div class="storyboard-image-edit-actions">
                <button type="button" class="btn btn-sm btn-primary" onclick="editStoryboardImage(${activeIndex})">上传当前图并重新生成</button>
                <a class="btn btn-sm btn-secondary" href="/${escAttr(imagePath)}" target="_blank">查看大图</a>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteStoryboardFrame(${activeIndex}, 'start')">删除分镜图</button>
            </div>
            <div class="field-hint">编辑时会把当前分镜图作为第一张参考图，并把这里的修改提示词一起提交；成功后自动覆盖当前分镜图。</div>
        </div>` : '';
    return `
        <div class="storyboard-image-page">
            <aside class="storyboard-image-sidebar">
                <div class="storyboard-image-sidebar-head">
                    <strong>分段导航</strong>
                    <span>${activeIndex + 1} / ${segments.length}</span>
                </div>
                <div class="storyboard-image-nav-list">
                    ${segments.map((item, i) => renderStoryboardImageSidebarItem(item, i, activeIndex)).join('')}
                </div>
                ${renderFlowSidebarChecklist(seg)}
            </aside>
            <section class="storyboard-image-main">
                ${renderFlowContext('script', segments)}
                <div class="storyboard-image-main-head">
                    <div>
                        <span class="eyebrow">分段 ${activeIndex + 1}</span>
                        <h3>${escHtml(title)}</h3>
                        <p>${duration}秒 · Image Prompt → 分镜图</p>
                    </div>
                    <div class="storyboard-image-head-actions">
                        ${imageStatus}
                        <button type="button" class="btn btn-sm btn-secondary" onclick="copySegmentImagePrompt(${activeIndex})" ${prompt ? '' : 'disabled'}>复制 Prompt</button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="regenerateStoryboardImage(${activeIndex})" ${prompt || seg.id ? '' : 'disabled'}>${imagePath ? '重新生成分镜图' : '生成分镜图'}</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="regenerateStoryboardImage(${activeIndex}, { regeneratePrompt: true })">重生 Prompt+图</button>
                    </div>
                </div>
                <div class="storyboard-image-workspace">
                    <div class="storyboard-image-prompt-panel">
                        <div class="script-prompt-original storyboard-image-source">
                            <strong>原台词分段</strong>
                            <span>${escHtml(sourceText || '暂无原台词')}</span>
                        </div>
                        <div class="storyboard-image-panel-head">
                            <strong>Image Prompt</strong>
                            <span>${prompt ? `${prompt.length}字` : '未生成'}</span>
                        </div>
                        <textarea class="storyboard-image-prompt-editor" id="storyboardPrompt-${activeIndex}" rows="18" placeholder="这里显示当前分段的 Image Prompt。可编辑后失焦保存，再生成分镜图。" onblur="saveStoryboardPromptEdit(${activeIndex})">${escHtml(prompt)}</textarea>
                    </div>
                    <div class="storyboard-image-preview-panel ${loading ? 'is-loading' : ''}">
                        <div class="storyboard-image-panel-head">
<strong>分镜图</strong>
                            <span>${imagePath ? '图片已生成' : (loading ? '生成中' : '等待生成')}</span>
                        </div>
                        ${loading ? `
                            <div class="storyboard-image-loading">
                                <span class="loading-spinner"></span>
                                <div><strong>正在生成分镜图</strong><small>你可以切换到其他分段继续检查 Prompt。</small></div>
                            </div>` : ''}
                        <div class="storyboard-image-preview-frame">
                            ${imagePreview}
                        </div>
                        ${storyboardEditTools}
                    </div>
                </div>
            </section>
        </div>`;
}

function renderVideoPromptPage(segments) {
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const seg = segments[activeIndex];
    normalizeSegmentState(seg);
    const imagePrompt = seg.storyboard_prompt || '';
    const imagePath = seg.storyboard_image_path || '';
    const videoPrompt = getSegmentVideoPrompt(seg);
    const title = getSegmentStoryTitle(seg, activeIndex);
    const loading = seg._videoPromptStatus === 'generating';
    const canGenerate = !!(imagePrompt && imagePath && seg.id);
    const imagePreview = imagePath
        ? `<img src="/${escAttr(imagePath)}" alt="分段 ${activeIndex + 1} 分镜图">`
        : `<div class="storyboard-image-empty">
                <strong>等待分镜图</strong>
                <span>先到第 01 页生成当前片段的分镜图。</span>
           </div>`;
    return `
        <div class="storyboard-image-page video-prompt-page">
            <aside class="storyboard-image-sidebar">
                <div class="storyboard-image-sidebar-head">
                    <strong>分段导航</strong>
                    <span>${activeIndex + 1} / ${segments.length}</span>
                </div>
                <div class="storyboard-image-nav-list">
                    ${segments.map((item, i) => renderVideoPromptSidebarItem(item, i, activeIndex)).join('')}
                </div>
                ${renderFlowSidebarChecklist(seg)}
            </aside>
            <section class="storyboard-image-main">
                ${renderFlowContext('image', segments)}
                <div class="storyboard-image-main-head">
                    <div>
                        <span class="eyebrow">分段 ${activeIndex + 1}</span>
                        <h3>${escHtml(title)}</h3>
                        <p>分镜提示 + 分镜图 → 视频提示</p>
                    </div>
                    <div class="storyboard-image-head-actions">
                        ${getVideoPromptStatus(seg)}
                        <button type="button" class="btn btn-sm btn-secondary" onclick="generateAllVideoPrompts()" ${segments.length ? '' : 'disabled'}>全部生成提示</button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="generateVideoPrompt(${activeIndex})" ${canGenerate && !loading ? '' : 'disabled'}>${videoPrompt ? '重生提示' : '生成提示'}</button>
                    </div>
                </div>
                <div class="video-prompt-workspace">
                    <div class="video-prompt-input-panel">
                        <div class="storyboard-image-panel-head">
                            <strong>输入：分镜提示</strong>
                            <span>${imagePrompt ? `${imagePrompt.length}字` : '未生成'}</span>
                        </div>
                        <textarea class="storyboard-image-prompt-editor video-prompt-input-editor" id="storyboardPrompt-${activeIndex}" rows="12" placeholder="这里显示第 1 页生成的分镜提示。" onblur="saveStoryboardPromptEdit(${activeIndex})">${escHtml(imagePrompt)}</textarea>
                        <div class="storyboard-image-panel-head video-prompt-image-head">
                            <strong>输入：分镜图</strong>
                            <span>${imagePath ? '已生成' : '等待生成'}</span>
                        </div>
                        <div class="storyboard-image-preview-frame video-prompt-image-frame">
                            ${imagePreview}
                        </div>
                    </div>
                    <div class="video-prompt-output-panel ${loading ? 'is-loading' : ''}">
                        <div class="storyboard-image-panel-head">
                            <strong>输出：视频提示</strong>
                            <span>${videoPrompt ? `${videoPrompt.length}字` : '未生成'}</span>
                        </div>
                        ${loading ? `
                            <div class="storyboard-image-loading">
                                <span class="loading-spinner"></span>
                                <div><strong>正在生成视频提示</strong><small>只使用当前片段和分镜图。</small></div>
                            </div>` : ''}
                        <textarea class="storyboard-image-prompt-editor video-prompt-output-editor" id="videoPrompt-${activeIndex}" rows="24" placeholder="生成后显示；可手动编辑。" onblur="saveVideoPromptEdit(${activeIndex})">${escHtml(videoPrompt)}</textarea>
                        <div class="video-prompt-actions">
                            <button type="button" class="btn btn-sm btn-secondary" onclick="saveVideoPromptEdit(${activeIndex})" ${videoPrompt ? '' : 'disabled'}>保存</button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="copyVideoPrompt(${activeIndex})" ${videoPrompt ? '' : 'disabled'}>复制</button>
                            <button type="button" class="btn btn-sm btn-primary" onclick="focusProductionFlowStep('video')" ${videoPrompt ? '' : 'disabled'}>生成视频</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>`;
}

function renderVideoGenerationSidebarItem(seg, i, activeIndex) {
    normalizeSegmentState(seg);
    const title = getSegmentStoryTitle(seg, i);
    const videoSrc = seg._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg._videoUrl || '');
    const running = (seg._genStatus || statusToGenStatus(seg.status)) === 'generating';
    const failed = (seg._genStatus || statusToGenStatus(seg.status)) === 'failed';
    const ready = !!videoSrc;
    const statusClass = failed ? 'failed' : (running ? 'running' : (ready ? 'ready' : ''));
    const statusText = failed ? '失败' : (running ? '生成中' : (ready ? '视频完成' : (getSegmentVideoPrompt(seg) ? '可生成' : '等提示')));
    const thumb = videoSrc
        ? `<video src="${escAttr(videoSrc)}" muted preload="metadata"></video>`
        : (seg.storyboard_image_path
            ? `<img src="/${escAttr(seg.storyboard_image_path)}" alt="分段 ${i + 1}">`
            : `<span>${i + 1}</span>`);
    return `
        <button type="button" class="storyboard-image-nav-item ${i === activeIndex ? 'active' : ''}" onclick="selectVideoGenerationSegment(${i})">
            <span class="storyboard-image-nav-thumb">${thumb}</span>
            <span class="storyboard-image-nav-copy">
                <strong>分段 ${i + 1}</strong>
                <small>${escHtml(title)}</small>
            </span>
            <span class="storyboard-image-nav-status ${statusClass}">${statusText}</span>
        </button>`;
}

function renderVideoGenerationPage(segments) {
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const seg = segments[activeIndex];
    normalizeSegmentState(seg);
    const title = getSegmentStoryTitle(seg, activeIndex);
    const imagePrompt = seg.storyboard_prompt || '';
    const imagePath = seg.storyboard_image_path || '';
    const videoPrompt = getSegmentVideoPrompt(seg);
    const videoPromptLoading = seg._videoPromptStatus === 'generating';
    const selectedRefs = seg._libraryImages || [];
    const mode = seg._mode || (selectedRefs.length ? 'omni_reference' : 'text_to_video');
    const ratio = seg._ratio || '16:9';
    const duration = normalizeVideoDuration(seg.duration || 15);
    const videoSrc = seg._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg._videoUrl || '');
    const { segStatus } = getSegmentStatusMeta(seg);
    const progressPercent = Number.isFinite(seg._progressPercent) ? seg._progressPercent : (segStatus === 'completed' ? 100 : (segStatus === 'generating' ? 8 : 0));
    const progressText = seg._progressText || (segStatus === 'generating' ? '视频任务进行中' : '');
    const videoProgress = getSegmentProgressMarkup(seg, activeIndex, segStatus, progressPercent, progressText);
    const canGenerateVideoPrompt = !!(imagePrompt && imagePath && seg.id) && !videoPromptLoading;
    const canGenerate = !!(videoPrompt && imagePath && seg.id) && segStatus !== 'generating';
    const imagePreview = imagePath
        ? `<img src="/${escAttr(imagePath)}" alt="分段 ${activeIndex + 1} 分镜图">`
        : `<div class="storyboard-image-empty"><strong>等待分镜图</strong><span>先在 01 生成分镜图。</span></div>`;
    const videoResult = videoSrc
        ? `<div class="segment-video-result video-generation-result"><video src="${escAttr(videoSrc)}" controls preload="none"></video>${seg._localVideoPath ? `<div class="local-path">已保存到资料库：${escHtml(seg._localVideoPath)}</div>` : ''}</div>`
        : `<div class="storyboard-image-empty video-generation-empty"><strong>${segStatus === 'generating' ? '视频生成中' : '等待视频'}</strong><span>${videoPrompt ? '点击生成后显示视频。' : '先生成视频提示。'}</span></div>`;
    const timelineItems = segments.map((item, i) => {
        normalizeSegmentState(item);
        const itemVideo = item._localVideoPath ? videoSrcWithCache(item._localVideoPath) : (item._videoUrl || item.video_url || item.local_video_path || '');
        const itemThumb = item.storyboard_image_path
            ? `<img src="/${escAttr(item.storyboard_image_path)}" alt="分镜 ${i + 1}">`
            : (itemVideo ? `<video src="${escAttr(itemVideo)}" muted preload="metadata"></video>` : `<span>${i + 1}</span>`);
        const itemDuration = normalizeVideoDuration(item.duration || 5);
        return `<button type="button" class="video-generation-timeline-item ${i === activeIndex ? 'active' : ''}" onclick="activeSegmentEditIndex=${i}; activeProductionFlowStep='video'; renderSegments(currentSegments);">
            <span class="video-generation-timeline-thumb">${itemThumb}</span>
            <strong>${i + 1}</strong>
            <small>${itemDuration}s</small>
        </button>`;
    }).join('');
    return `
        <div class="storyboard-image-page video-generation-page" id="segment-${activeIndex}">
            <aside class="storyboard-image-sidebar">
                <div class="storyboard-image-sidebar-head">
                    <strong>分段导航</strong>
                    <span>${activeIndex + 1} / ${segments.length}</span>
                </div>
                <div class="storyboard-image-nav-list">
                    ${segments.map((item, i) => renderVideoGenerationSidebarItem(item, i, activeIndex)).join('')}
                </div>
                ${renderFlowSidebarChecklist(seg)}
            </aside>
            <section class="storyboard-image-main">
                ${renderFlowContext('video', segments)}
                <div class="storyboard-image-main-head">
                    <div>
                        <span class="eyebrow">02 分镜 / 视频</span>
                        <h3>${escHtml(title)}</h3>
                        <p>分镜图 + 视频提示 → 视频</p>
                    </div>
                    <div class="storyboard-image-head-actions">
                        ${getVideoStageStatus(seg, segStatus, videoSrc)}
                        <button type="button" class="btn btn-sm btn-secondary" onclick="generateAllVideos()" ${segments.length ? '' : 'disabled'}>全部生成视频</button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="generateSingleVideo(${activeIndex})" ${canGenerate ? '' : 'disabled'}>${videoSrc ? '重新生成视频' : '生成视频'}</button>
                    </div>
                </div>
                <div class="video-prompt-workspace video-generation-workspace">
                    <div class="video-prompt-input-panel video-generation-middle-panel">
                        <section class="video-generation-storyboard-box">
                            <div class="storyboard-image-panel-head">
                                <strong>输入：分镜图</strong>
                                <span>${imagePath ? '已生成' : '等待生成'}</span>
                            </div>
                            <div class="storyboard-image-preview-frame video-prompt-image-frame">
                                ${imagePreview}
                            </div>
                        </section>
                        <section class="video-generation-prompt-box ${videoPromptLoading ? 'is-loading' : ''}">
                            <div class="storyboard-image-panel-head">
                                <strong>视频提示</strong>
                                <span>${videoPrompt ? `${videoPrompt.length}字` : '未生成'}</span>
                            </div>
                            ${videoPromptLoading ? `<div class="storyboard-image-loading"><span class="loading-spinner"></span><div><strong>正在生成视频提示</strong><small>只使用当前片段和分镜图。</small></div></div>` : ''}
                            <div class="segment-editor mention-editor stage-video-editor video-generation-prompt-editor" id="segEditor-${activeIndex}" data-rows="14" data-placeholder=""></div>
                            <div class="video-prompt-actions video-generation-prompt-actions">
                                <button type="button" class="btn btn-sm btn-secondary" onclick="generateVideoPrompt(${activeIndex})" ${canGenerateVideoPrompt ? '' : 'disabled'}>${videoPrompt ? '重生提示' : '生成提示'}</button>
                                <button type="button" class="btn btn-sm btn-primary" onclick="generateSingleVideo(${activeIndex})" ${canGenerate ? '' : 'disabled'}>${videoSrc ? '重生视频' : '生成视频'}</button>
                            </div>
                            <div class="mention-preview-row compact">
                                <button type="button" class="btn btn-sm btn-secondary mention-insert-btn" onclick="openMentionPickerForButton(${activeIndex})">@ 插入</button>
                                <span class="mention-preview-hint">需要额外人物、场景或提示词库时再插入。</span>
                            </div>
                        </section>

                    </div>
                    <div class="video-prompt-output-panel ${segStatus === 'generating' ? 'is-loading' : ''}">
                        <div class="storyboard-image-panel-head">
                            <strong>输出：生成视频</strong>
                            <span>${videoSrc ? '视频已生成' : (segStatus === 'generating' ? '生成中' : '未生成')}</span>
                        </div>
                        ${videoProgress}
                        <div class="storyboard-image-preview-frame video-generation-frame">
                            ${videoResult}
                        </div>
                        <div class="video-generation-functional-settings">
                            <div class="video-generation-setting-tabs"><button class="active">画面</button><button>音效</button></div>
                            <div class="video-generation-setting-grid">
                                <label>模式<select id="segMode-${activeIndex}" class="seg-mode-select" onchange="onSegModeChange(${activeIndex})"><option value="text_to_video" ${mode==='text_to_video'?'selected':''}>文生视频</option><option value="omni_reference" ${mode==='omni_reference'?'selected':''}>参考图</option></select></label>
                                <label>比例<select id="segRatio-${activeIndex}" class="seg-small-select">${['16:9','9:16','1:1','4:3','3:4','21:9','adaptive'].map(r => `<option value="${r}" ${ratio === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
                                <label>时长<input type="number" id="segDuration-${activeIndex}" min="4" max="15" value="${duration}" class="seg-duration-input"></label>
                                <label>运镜<select><option>自动</option><option>推近</option><option>横移</option><option>固定</option></select></label>
                            </div>
                            <div id="segRefWrap-${activeIndex}" class="video-generation-reference-row ${mode==='text_to_video'?'hidden':''}">
                                <span>参考图</span><input type="file" id="segFile-${activeIndex}" accept="image/*" multiple onchange="onSegmentFilesChange(${activeIndex})"><span id="segFileCount-${activeIndex}" class="segment-file-count">${seg._uploadFileCount || 0}张</span>
                            </div>
                        </div>
                        ${typeof renderSegmentVersionHistory === 'function' ? renderSegmentVersionHistory(seg, 'video', activeIndex) : ''}
                        <div class="video-prompt-actions video-generation-video-actions">
                            <button type="button" class="btn btn-sm btn-primary" onclick="generateSingleVideoFromPrevious(${activeIndex})" ${activeIndex > 0 && videoPrompt ? '' : 'disabled'}>接上条视频</button>
                        </div>
                    </div>
                </div>
                <div class="video-generation-timeline-strip">
                    <div class="video-generation-timeline-head"><strong>分镜轨道</strong><span>${segments.length} 段</span></div>
                    <div class="video-generation-timeline-list">${timelineItems}</div>
                </div>
            </section>
        </div>`;
}

function setProductionFlowActiveStep(step) {
    if (step === 'prompt') step = 'script';
    activeProductionFlowStep = step || 'script';
    syncProductionFlowLayout();
    document.querySelectorAll('.production-top-step').forEach(el => {
        el.classList.toggle('active', el.dataset.flowStep === activeProductionFlowStep);
    });
}

function syncProductionFlowLayout() {
    const layout = document.querySelector('#tab-script .script-layout');
    if (!layout) return;
    const focused = (activeProductionFlowStep || 'script') !== 'script';
    layout.classList.toggle('flow-stage-focused', focused);
}

function focusProductionFlowStep(step) {
    if (step === 'prompt') step = 'script';
    setProductionFlowActiveStep(step);
    if (step === 'script') {
        setWorkflowInputCollapsed('script', false, { manual: true });
        setWorkflowOutputCollapsed('script', false, { manual: true });
        renderSegments(currentSegments);
        document.getElementById('scriptInput')?.focus();
        return;
    }
    setWorkflowOutputCollapsed('script', false, { manual: true });
    if (currentSegments.length) renderSegments(currentSegments);
    const targetMap = {
        image: '.video-prompt-page',
        video: '.video-prompt-page',
        edit: '.video-generation-page, #mergedVideoPanel, .video-editor-entry-card'
    };
    const target = document.querySelector(targetMap[step] || '#segmentsList');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateProductionTopBanner() {
    currentSegments.forEach(normalizeSegmentState);
    const total = currentSegments.length;
    const prompts = currentSegments.filter(seg => seg?.storyboard_prompt).length;
    const images = currentSegments.filter(seg => seg?.storyboard_image_path).length;
    const videoPrompts = currentSegments.filter(seg => getSegmentVideoPrompt(seg)).length;
    const videos = currentSegments.filter(seg => seg?._localVideoPath || seg?._videoUrl || seg?.video_url || seg?.local_video_path || seg?.status === 'completed').length;
    const runningPrompt = currentSegments.some(seg => seg?.storyboard_status === 'generating' && !seg?.storyboard_image_path);
    const runningVideo = currentSegments.some(seg => (seg?._genStatus || statusToGenStatus(seg?.status)) === 'generating');
    const scriptText = document.getElementById('scriptInput')?.value?.trim() || currentProjectInfo?.script_text || '';

    const scriptMeta = document.getElementById('flowStepScriptMeta');
    const imageMeta = document.getElementById('flowStepImageMeta');
    const videoMeta = document.getElementById('flowStepVideoMeta');
    const editMeta = document.getElementById('flowStepEditMeta');

    if (scriptMeta) scriptMeta.textContent = runningPrompt
        ? '提示 / 分镜生成中'
        : (total ? `${total} 段，${prompts}/${total} 提示，${images}/${total} 图` : (scriptText ? '台本已输入' : '等待台本'));
    if (imageMeta) imageMeta.textContent = total ? `${videoPrompts}/${total} 视频提示` : '等待分镜图';
    if (videoMeta) videoMeta.textContent = runningVideo
        ? '视频生成中'
        : (total ? `${videoPrompts}/${total} 视频提示，${videos}/${total} 视频` : '等待视频提示');
    if (editMeta) editMeta.textContent = videos ? `${videos}/${total || videos} 视频可编辑` : '等待视频';

    const stepEls = {
        script: document.querySelector('.production-top-step[data-flow-step="script"]'),
        image: document.querySelector('.production-top-step[data-flow-step="image"]'),
        video: document.querySelector('.production-top-step[data-flow-step="video"]'),
        edit: document.querySelector('.production-top-step[data-flow-step="edit"]')
    };
    const stepStates = {
        script: total && images === total ? 'done' : (runningPrompt ? 'running' : (total ? 'running' : 'blocked')),
        image: total && videoPrompts === total ? 'done' : (total && images ? 'running' : 'blocked'),
        video: total && videos === total ? 'done' : (runningVideo ? 'running' : (total && (videoPrompts || images) ? 'running' : 'blocked')),
        edit: videos ? 'running' : 'blocked'
    };
    Object.entries(stepEls).forEach(([key, el]) => {
        if (!el) return;
        el.classList.remove('done', 'running', 'blocked');
        el.classList.add(stepStates[key]);
    });

    setProductionFlowActiveStep(activeProductionFlowStep || 'script');
}

async function copyImagePromptToStoryboardColumn(index) {
    const seg = currentSegments[index];
    if (!seg) return;
    const source = (seg.storyboard_prompt || '').trim();
    if (!source) {
        showToast(`片段 ${index + 1} 还没有 Image Prompt，请先生成`, 'warning');
        return;
    }
    const target = document.getElementById(`storyboardPrompt-${index}`);
    if (target) target.value = source;
    seg.storyboard_prompt = source;
    await saveSegmentState(index, { storyboard_prompt: source, storyboard_status: seg.storyboard_status || 'prompt_ready' });
    showToast(`片段 ${index + 1} 已带入分镜图栏`, 'success');
}

function copyStoryboardPromptToVideoColumn(index) {
    const seg = currentSegments[index];
    if (!seg) return;
    const source = (document.getElementById(`storyboardPrompt-${index}`)?.value || seg.storyboard_prompt || '').trim();
    if (!source) {
        showToast(`片段 ${index + 1} 没有可带入的视频依据`, 'warning');
        return;
    }
    const editor = document.getElementById(`segEditor-${index}`);
    const text = `使用上一栏 Image Prompt 与当前分镜图作为视频生成依据。\n\n${source}`;
    if (editor) writeMentionEditorValue(editor, text);
    seg.prompt = text;
    seg.prompt_text = text;
    seg._videoPromptDirty = true;
    showToast(`片段 ${index + 1} 已带入视频栏，可继续微调`, 'success');
}

function buildVideoPromptSourceForModel(index, imagePrompt, imagePath) {
    return [
        `当前片段：分段 ${index + 1}`,
        '输入一：Image Prompt',
        imagePrompt,
        '',
        '输入二：已生成分镜图',
        imagePath ? `分镜图路径：${imagePath}` : '分镜图尚未生成',
        '请把分镜图视为构图、人物站位、镜头顺序、运动方向和情绪节奏锚点。'
    ].join('\n');
}

function buildVideoPromptGenerationInstruction(seg, index) {
    return [
        '使用“对话-视频skill”的规则，把输入的 Image Prompt 与已生成分镜图转换成一个可直接复制给 Seedance 的视频提示词。',
        '本步骤禁止读取、复述或重新输入原段台本；不要重新拆段、不要重新分段、不要输出多个片段；不要把整段台本作为依据。',
        '只能依据本次输入里的 Image Prompt、分镜图路径/分镜图说明、人物/场景/资产锁定信息生成。',
        '当前输入已经是单个片段，必须只生成一个完整中文视频提示词；视频时长固定写为 15秒；不要 JSON，不要解释，不要 Markdown 标题。',
        '把 Image Prompt 里的每格镜头、台词语义、口型、表情、动作、视线、机位、运动方向和节奏翻译为连续视频表现。',
        '说话者有图片编号时使用格式：【图1】说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）。没有图像编号但有文本角色定义时使用格式：委托人说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）。',
        '分镜图是构图锚点，不是要重画的平面图；视频里禁止出现分镜格、格线、箭头、编号、字幕、对白框、说明文字、UI、logo、水印。',
        '保留角色服装体型发型、场景锚点、光线方向、左右关系和前后景关系；不要增加未出现的新角色或新地点。',
        '镜头要有明确起止状态、运动方式、人物表演和情绪节奏，并适合单段视频生成。'
    ].join('\n');
}

async function saveVideoPromptEdit(index) {
    const seg = currentSegments[index];
    if (!seg?.id) return;
    const promptEl = document.getElementById(`videoPrompt-${index}`);
    const prompt = (promptEl?.value || '').trim();
    if (!prompt) {
        return;
    }
    if (prompt === getSegmentVideoPrompt(seg)) return;
    seg.prompt = prompt;
    seg.prompt_text = prompt;
    seg._videoPromptDirty = true;
    seg._videoPromptStatus = 'ready';
    await saveSegmentState(index, { prompt_text: prompt });
    const resultEl = document.getElementById('resultContent');
    if (resultEl) resultEl.textContent = currentSegments.map(s => getSegmentVideoPrompt(s) || s.prompt || s.prompt_text || '').join('\n\n===VIDEO_SPLIT===\n\n');
    updateProductionTopBanner();
    showToast(`片段 ${index + 1} Video Prompt 已保存`, 'success');
}

async function copyVideoPrompt(index) {
    const seg = currentSegments[index];
    const promptEl = document.getElementById(`videoPrompt-${index}`);
    const text = (promptEl?.value || getSegmentVideoPrompt(seg)).trim();
    if (!text) {
        showToast(`片段 ${index + 1} 还没有 Video Prompt`, 'warning');
        return;
    }
    await copyText(text);
}

async function generateVideoPrompt(index, options = {}) {
    const seg = currentSegments[index];
    if (!seg?.id) {
        showToast('请先生成分段后再生成 Video Prompt', 'warning');
        return false;
    }
    normalizeSegmentState(seg);
    const imagePromptEl = document.getElementById(`storyboardPrompt-${index}`);
    const imagePrompt = (imagePromptEl?.value || seg.storyboard_prompt || '').trim();
    const imagePath = seg.storyboard_image_path || '';
    if (!imagePrompt) {
        showToast(`片段 ${index + 1} 还没有 Image Prompt，请先在第 1 页生成`, 'warning');
        return false;
    }
    if (!imagePath) {
        showToast(`片段 ${index + 1} 还没有分镜图，请先在第 01 页生成分镜图`, 'warning');
        return false;
    }

    seg.storyboard_prompt = imagePrompt;
    seg._videoPromptStatus = 'generating';
    renderSegments(currentSegments);
    const anchor = document.querySelector('.video-prompt-output-panel') || document.querySelector(`#videoPrompt-${index}`);
    if (!options.silentLoading) {
        startInlineFakeProgress(`video-prompt-${index}`, anchor, `正在生成片段 ${index + 1} Video Prompt`, 90);
        showToast(`片段 ${index + 1} Video Prompt 生成任务已提交`, 'info');
    }

    try {
        const currentScript = buildVideoPromptSourceForModel(index, imagePrompt, imagePath);
        const assetScope = getScopedAssetPayload(imagePrompt, { segment: seg, fallbackToSelected: false });
        const instruction = [
            buildVideoPromptGenerationInstruction(seg, index),
            buildAssetScopeInstruction(assetScope, `片段${index + 1}`)
        ].join('\n\n');
        const res = await fetch(`/api/segments/${seg.id}/reprocess-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_script: currentScript,
                instruction,
                scenes: assetScope.scenes,
                characters: assetScope.characters,
                director_mode_id: document.getElementById('directorModeSelect')?.value || ''
            })
        });
        const data = await res.json();
        if (!res.ok) {
            seg._videoPromptStatus = 'failed';
            renderSegments(currentSegments);
            if (!options.silentLoading) showToast(data.error || 'Video Prompt 生成失败', 'error');
            return false;
        }

        const updatedSegment = data.segment || data;
        const generated = (updatedSegment.prompt_text || updatedSegment.prompt || data.result || '').trim();
        if (!generated) {
            seg._videoPromptStatus = 'failed';
            renderSegments(currentSegments);
            if (!options.silentLoading) showToast('Video Prompt 生成结果为空', 'warning');
            return false;
        }
        currentSegments[index] = {
            ...currentSegments[index],
            ...updatedSegment,
            prompt: generated,
            prompt_text: generated,
            storyboard_prompt: imagePrompt,
            storyboard_image_path: imagePath,
            _videoPromptDirty: true,
            _videoPromptStatus: 'ready'
        };
        await saveSegmentState(index, { prompt_text: generated, storyboard_prompt: imagePrompt, storyboard_status: currentSegments[index].storyboard_status || 'image_ready' });
        const resultEl = document.getElementById('resultContent');
        if (resultEl) resultEl.textContent = currentSegments.map(s => getSegmentVideoPrompt(s) || s.prompt || s.prompt_text || '').join('\n\n===VIDEO_SPLIT===\n\n');
        renderSegments(currentSegments);
        if (!options.silentLoading) showToast(`片段 ${index + 1} 视频提示已生成`, 'success');
        return true;
    } catch (e) {
        seg._videoPromptStatus = 'failed';
        renderSegments(currentSegments);
        if (!options.silentLoading) showToast('Video Prompt 请求失败: ' + e.message, 'error');
        return false;
    } finally {
        if (!options.silentLoading) stopInlineFakeProgress(`video-prompt-${index}`);
    }
}

async function generateAllVideoPrompts() {
    if (!currentSegments.length) {
        showToast('当前没有可生成的片段', 'warning');
        return;
    }
    const btn = document.querySelector('[onclick="generateAllVideoPrompts()"]');
    const resetBtn = setButtonBusy(btn, '生成中');
    startInlineFakeProgress('all-video-prompts', btn, '正在逐段生成 Video Prompt', 240);
    try {
        const queue = currentSegments
            .map((seg, index) => ({ seg, index }))
            .filter(item => item.seg?.id && item.seg?.storyboard_prompt && item.seg?.storyboard_image_path);
        if (!queue.length) {
            showToast('还没有可生成 Video Prompt 的片段，请先完成 Image Prompt 和分镜图', 'warning');
            return;
        }
        const results = [];
        for (let i = 0; i < queue.length; i += 1) {
            updateInlineFakeProgress('all-video-prompts', Math.min(90, 10 + i * 10), `正在生成片段 ${queue[i].index + 1} Video Prompt`);
            results.push(await generateVideoPrompt(queue[i].index, { silentLoading: true }));
        }
        const okCount = results.filter(Boolean).length;
        renderSegments(currentSegments);
        showToast(`Video Prompt 逐段生成完成 ${okCount}/${queue.length}`, okCount === queue.length ? 'success' : 'warning');
    } catch (e) {
        showToast('Video Prompt 批量生成失败: ' + e.message, 'error');
    } finally {
        stopInlineFakeProgress('all-video-prompts');
        resetBtn();
    }
}

function renderActiveSegmentDetail(seg, i) {
    normalizeSegmentState(seg);
    const duration = seg.duration || 5;
    const sbCount = seg.storyboard_count || '?';
    const scene = seg.scene || '';
    const lines = (seg.prompt || seg.prompt_text || '').split('\n').length;
    const rows = Math.min(Math.max(lines + 2, 6), 18);
    const { segStatus, statusLabel, statusClass } = getSegmentStatusMeta(seg);
    const selectedRefs = seg._libraryImages || [];
    const mode = seg._mode || (selectedRefs.length ? 'omni_reference' : 'text_to_video');
    const videoSrc = seg._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg._videoUrl || '');
    const taskText = seg._taskId ? `<span class="badge" style="font-size:11px">任务 ${escHtml(seg._taskId)}</span>` : '';
    const pipelineBadges = [
        `<span class="badge" style="font-size:11px">Image ${seg.storyboard_prompt ? '✓' : '○'}</span>`,
        `<span class="badge" style="font-size:11px">分镜 ${seg.storyboard_image_path ? '✓' : '○'}</span>`,
        `<span class="badge" style="font-size:11px">Video Prompt ${getSegmentVideoPrompt(seg) ? '✓' : '○'}</span>`,
        `<span class="badge" style="font-size:11px">视频 ${videoSrc ? '✓' : '○'}</span>`
    ].join('');

    const progressPercent = Number.isFinite(seg._progressPercent) ? seg._progressPercent : (segStatus === 'completed' ? 100 : (segStatus === 'generating' ? 8 : 0));
    const progressText = seg._progressText || (segStatus === 'generating' ? '任务进行中，可继续操作其他片段' : '');
    const showProgress = segStatus === 'generating' || segStatus === 'completed' || segStatus === 'failed';

    const title = getSegmentStoryTitle(seg, i);
    const scriptText = seg._original || seg.prompt_text || seg.prompt || '';
    const storyboardPrompt = seg.storyboard_prompt || '';
    const storyboardStatus = seg.storyboard_status || (storyboardPrompt ? 'prompt_ready' : 'not_ready');
    const storyboardLoading = storyboardStatus === 'generating';
    const imagePath = seg.storyboard_image_path || '';
    const videoProgress = getSegmentProgressMarkup(seg, i, segStatus, progressPercent, progressText);

    return `
        <div class="segment-item segment-detail-card production-detail-card" id="segment-${i}">
            <div class="production-unit-head">
                <div class="production-unit-title">
                    <span class="drag-dots">⋮⋮</span>
                    <div>
                        <strong>叙事单元 ${i + 1}｜${escHtml(title)}</strong>
                        <span>${duration}秒 · ${sbCount}个镜头${scene ? ` · ${escHtml(scene)}` : ''}</span>
                    </div>
                </div>
                <div class="production-unit-actions">
                    ${pipelineBadges}
                    ${taskText}
                    <span class="segment-status ${statusClass}">${statusLabel}</span>
                    <button class="btn btn-sm btn-danger" onclick="deleteSegment(${i})">删除</button>
                </div>
            </div>

            <div class="production-stage-grid">
                <section class="production-stage stage-script">
                    <div class="production-stage-head">
                        <div>
                            <span class="stage-index">1</span>
                            <strong>台本 → Image Prompt</strong>
                        </div>
                        ${getStoryboardPromptStatus(seg)}
                    </div>
                    <div class="stage-block">
                        <label>短段落台本</label>
                        <pre class="stage-script-preview">${escHtml(scriptText || '等待台本分段')}</pre>
                    </div>
                    <div class="stage-block">
                        <label>Image Prompt 预览</label>
                        <pre class="stage-prompt-preview">${escHtml(storyboardPrompt || '尚未生成 Image Prompt')}</pre>
                    </div>
                    <div class="stage-actions">
                        <button class="btn btn-sm btn-primary" onclick="generateStoryboardPrompt(${i})">生成 Image Prompt</button>
                        <button class="btn btn-sm btn-secondary" onclick="copyImagePromptToStoryboardColumn(${i})">带入下一栏</button>
                    </div>
                </section>

                <section class="production-stage stage-storyboard storyboard-block ${imagePath ? 'has-image' : ''}">
                    <div class="production-stage-head">
                        <div>
                            <span class="stage-index">2</span>
                            <strong>Image Prompt → 分镜图</strong>
                        </div>
                        ${getStoryboardImageStatus(seg)}
                    </div>
                    ${storyboardLoading ? `
                        <div class="stage-loading">
                            <span class="loading-spinner"></span>
                            <div>
                                <strong>正在生成分镜图</strong>
                                <span>${escHtml(seg.continuity_notes || '已提交任务，可继续操作其他片段')}</span>
                            </div>
                        </div>` : ''}
                    <textarea class="storyboard-prompt-editor stage-textarea" id="storyboardPrompt-${i}" rows="8" placeholder="当前片段的 Image Prompt：按格写清镜头、人物站位、动作，并标明每句台词对应哪一格；画面禁止字幕和对白框。" onblur="saveStoryboardPromptEdit(${i})">${escHtml(storyboardPrompt)}</textarea>
                    <div class="stage-actions">
                        <button class="btn btn-sm btn-primary" onclick="regenerateStoryboardImage(${i})">${imagePath ? '重新生成分镜图' : '生成分镜图'}</button>
                        <button class="btn btn-sm btn-secondary" onclick="regenerateStoryboardImage(${i}, { regeneratePrompt: true })">重生 Prompt+图</button>
                        <button class="btn btn-sm btn-secondary" onclick="copyStoryboardPromptToVideoColumn(${i})">带入视频栏</button>
                    </div>
                    ${imagePath ? `
                        <div class="storyboard-preview stage-image-preview">
                            <img src="/${escAttr(imagePath)}" alt="片段${i + 1}分镜图">
                        </div>
                        <details class="stage-inline-details">
                            <summary>编辑当前分镜图</summary>
                            <textarea class="storyboard-prompt-editor" id="storyboardEditPrompt-${i}" rows="4" placeholder="例如：第3格改成近景眼神特写；保持其他格子不变" oninput="currentSegments[${i}]._storyboardEditPrompt = this.value">${escHtml(seg._storyboardEditPrompt || '')}</textarea>
                            <div class="stage-actions">
                                <button class="btn btn-sm btn-primary" onclick="editStoryboardImage(${i})">上传当前图并重新生成</button>
                                <a class="btn btn-sm btn-secondary" href="/${escAttr(imagePath)}" target="_blank">查看大图</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteStoryboardFrame(${i}, 'start')">删除分镜图</button>
                            </div>
                        </details>` : `
                        <div class="stage-empty-preview">分镜图会显示在这里</div>`}
                    ${seg.continuity_notes ? `<div class="storyboard-notes">${escHtml(seg.continuity_notes)}</div>` : ''}
                </section>

                <section class="production-stage stage-video">
                    <div class="production-stage-head">
                        <div>
                            <span class="stage-index">3</span>
                            <strong>分镜图 → 视频</strong>
                        </div>
                        ${getVideoStageStatus(seg, segStatus, videoSrc)}
                    </div>
                    ${videoProgress}
                    <div class="segment-editor mention-editor stage-video-editor" id="segEditor-${i}" data-rows="${Math.min(Math.max(rows, 5), 10)}" data-placeholder="可选：补充视频动作、节奏、镜头运动要求。主线会自动使用上一栏 Image Prompt 和分镜图。"></div>
                    <div class="mention-preview-row compact">
                        <button type="button" class="btn btn-sm btn-secondary mention-insert-btn" onclick="openMentionPickerForButton(${i})">@ 插入</button>
                        <span class="mention-preview-hint">需要额外人物、场景或提示词库时再插入。</span>
                    </div>
                    <div class="stage-actions">
                        <button class="btn btn-sm btn-primary" onclick="generateSingleVideo(${i})">生成视频</button>
                        <button class="btn btn-sm btn-primary" onclick="generateSingleVideoFromPrevious(${i})">接上条视频</button>
                    </div>
                    ${videoSrc ? `<div class="segment-video-result stage-video-result"><video src="${escAttr(videoSrc)}" controls preload="none"></video>${seg._localVideoPath ? `<div class="local-path">已保存到资料库：${escHtml(seg._localVideoPath)}</div>` : ''}</div>` : `<div class="stage-empty-preview">视频完成后显示在这里</div>`}
                    <details class="stage-inline-details">
                        <summary>视频参数 / 参考图</summary>
                        <div class="segment-mode-row">
                            <label>生成模式</label>
                            <select id="segMode-${i}" class="seg-mode-select" onchange="onSegModeChange(${i})">
                                <option value="text_to_video" ${mode==='text_to_video'?'selected':''}>文生视频</option>
                                <option value="omni_reference" ${mode==='omni_reference'?'selected':''}>参考图模式（图库/上传）</option>
                            </select>
                            <label>比例</label>
                            <select id="segRatio-${i}" class="seg-small-select">
                                ${['16:9','9:16','1:1','4:3','3:4','21:9','adaptive'].map(r => `<option value="${r}" ${(seg._ratio || '16:9') === r ? 'selected' : ''}>${r}</option>`).join('')}
                            </select>
                            <label>时长</label>
                            <input type="number" id="segDuration-${i}" min="4" max="15" value="${duration}" class="seg-duration-input">
                        </div>
                        <div id="segRefWrap-${i}" class="${mode==='text_to_video'?'hidden':''}">
                            <div class="segment-upload-row">
                                <span>临时上传参考图：</span>
                                <input type="file" id="segFile-${i}" accept="image/*" multiple onchange="onSegmentFilesChange(${i})">
                                <span id="segFileCount-${i}" class="segment-file-count">${seg._uploadFileCount || 0}张</span>
                            </div>
                        </div>
                    </details>
                </section>
            </div>

            <details class="mainline-extra-drawer">
                <summary>Extra / 高级能力</summary>
                <div class="extra-drawer-grid">
                    <div>
                        <div class="form-group">
                            <label>本片段二次处理</label>
                            <div class="segment-editor mention-editor segment-instruction-editor" id="segmentReprocessInstruction-${i}" data-rows="5" data-placeholder="按新台本修正本片段、加强动作细节、控制时长，或 @ 引用人物/场景素材。"></div>
                            <div class="mention-preview-row">
                                <button type="button" class="btn btn-sm btn-secondary mention-insert-btn" onclick="openMentionPickerForReprocess(${i})">@ 插入</button>
                                <span class="mention-preview-hint">只影响当前片段。</span>
                            </div>
                            <div class="instruction-file-row">
                                <span>上传指导文件</span>
                                <input type="file" accept=".md,.txt,text/markdown,text/plain" onchange="loadInstructionFileToTextarea(this, 'segmentReprocessInstruction-${i}')">
                            </div>
                        </div>
                        <button id="btnReprocessSegment-${i}" class="btn btn-primary btn-lg" onclick="reprocessSingleSegment(${i})">二次处理本片段</button>
                    </div>
                    <div>${renderControlDataBlock(seg, i) || '<div class="stage-empty-preview">暂无 3D 摄影控制数据</div>'}</div>
                </div>
            </details>
        </div>`;
}

function initActiveSegmentEditors(seg, i) {
    const root = document.getElementById(`segEditor-${i}`);
    if (!root) return;
    const rows = parseInt(root.dataset.rows || '6', 10);
    root.style.minHeight = `${Math.max(rows, 6) * 1.6}em`;
    const editor = attachMentionEditor(root, {
        placeholder: root.dataset.placeholder || '',
        onInput: (ed) => {
            seg.prompt = ed.getValue();
            seg._videoPromptDirty = true;
        },
        onMentionTrigger: (query, anchorRect) => {
            openMentionPickerForEditor(editor, anchorRect);
            const search = document.getElementById('mentionPickerSearch');
            if (search) {
                search.value = query || '';
                search.dispatchEvent(new Event('input', { bubbles: true }));
            }
        },
        onMentionTriggerClose: () => {
            if (_mentionPickerCtx && _mentionPickerCtx.kind === 'editor') {
                closeMentionPicker();
            }
        },
    });
    const legacyRefImages = Array.isArray(seg.reference_images) ? seg.reference_images : [];
    const editorValue = isStoryboardModeEnabled() && !seg._videoPromptDirty ? '' : (seg.prompt || seg.prompt_text || '');
    editor.setValue(editorValue, { legacyRefImages });

    const instructionRoot = document.getElementById(`segmentReprocessInstruction-${i}`);
    if (instructionRoot) {
        const instructionRows = parseInt(instructionRoot.dataset.rows || '5', 10);
        instructionRoot.style.minHeight = `${Math.max(instructionRows, 5) * 1.6}em`;
        const instructionEditor = attachMentionEditor(instructionRoot, {
            placeholder: instructionRoot.dataset.placeholder || '',
            onMentionTrigger: (query, anchorRect) => {
                openMentionPickerForEditor(instructionEditor, anchorRect);
                const search = document.getElementById('mentionPickerSearch');
                if (search) {
                    search.value = query || '';
                    search.dispatchEvent(new Event('input', { bubbles: true }));
                }
            },
            onMentionTriggerClose: () => {
                if (_mentionPickerCtx && _mentionPickerCtx.kind === 'editor') {
                    closeMentionPicker();
                }
            },
        });
        instructionEditor.setValue('');
    }
}

function renderVideoEditStudioPage(segments) {
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const seg = segments[activeIndex] || {};
    normalizeSegmentState(seg);
    const title = getSegmentStoryTitle(seg, activeIndex);
    const videoSrc = seg._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg._videoUrl || seg.video_url || seg.local_video_path || '');
    const imagePath = seg.storyboard_image_path || '';
    const promptText = getSegmentVideoPrompt(seg) || seg.prompt_text || seg.prompt || '';
    const duration = normalizeVideoDuration(seg.duration || 5);
    const totalDuration = segments.reduce((sum, item) => sum + normalizeVideoDuration(item?.duration || 5), 0);
    const projectTitle = currentProjectInfo?.name || '未命名视频';
    const markerList = segments.map((item, i) => {
        const d = normalizeVideoDuration(item?.duration || 5);
        return `<span class="edit-studio-ruler-mark">${i === 0 ? '00:00' : '+' + d + 's'}</span>`;
    }).join('');
    const sceneList = segments.map((item, i) => {
        normalizeSegmentState(item);
        const itemVideo = item._localVideoPath ? videoSrcWithCache(item._localVideoPath) : (item._videoUrl || item.video_url || item.local_video_path || '');
        const itemThumb = item.storyboard_image_path
            ? `<img src="/${escAttr(item.storyboard_image_path)}" alt="场景${i + 1}">`
            : (itemVideo ? `<video src="${escAttr(itemVideo)}" muted preload="metadata"></video>` : `<span>${i + 1}</span>`);
        return `
            <button type="button" class="edit-studio-scene ${i === activeIndex ? 'active' : ''}" onclick="activeSegmentEditIndex=${i}; activeProductionFlowStep='edit'; renderSegments(currentSegments);">
                <span class="edit-studio-scene-thumb">${itemThumb}</span>
                <span class="edit-studio-scene-copy"><strong>场景${i + 1}</strong><small>${escHtml(getSegmentStoryTitle(item, i))}</small></span>
                <span class="edit-studio-scene-menu">⋯</span>
            </button>`;
    }).join('');
    const clipList = segments.map((item, i) => {
        const d = normalizeVideoDuration(item?.duration || 5);
        const width = Math.max(96, d * 18);
        const cls = i === activeIndex ? 'active' : '';
        return `<button type="button" class="edit-studio-clip ${cls}" style="width:${width}px" onclick="activeSegmentEditIndex=${i}; activeProductionFlowStep='edit'; renderSegments(currentSegments);"><strong>场景${i + 1}</strong><small>${d}s</small></button>`;
    }).join('');
    const preview = videoSrc
        ? `<video id="editStudioPreviewVideo" src="${escAttr(videoSrc)}" controls preload="metadata"></video>`
        : (imagePath ? `<img src="/${escAttr(imagePath)}" alt="当前分镜图">` : `<div class="edit-studio-empty"><strong>点击生成视频</strong><span>成片会显示在这里</span></div>`);
    return `
        <div class="edit-studio-page">
            <aside class="edit-studio-scenes">
                <div class="edit-studio-panel-head"><strong>场景</strong><button type="button" onclick="showToast('场景添加会在后续接入', 'info')">+</button></div>
                <div class="edit-studio-scene-list">${sceneList}</div>
            </aside>
            <section class="edit-studio-main">
                <div class="edit-studio-project-bar">
                    <div><strong>${escHtml(projectTitle)}</strong><small>场景 ${activeIndex + 1} / ${segments.length}</small></div>
                    <div><button class="btn btn-sm btn-secondary" onclick="mergeProjectVideos()">导出</button><button class="btn btn-sm btn-primary" onclick="mergeProjectVideos()">发布</button></div>
                </div>
                <div class="edit-studio-preview">
                    <span class="edit-studio-zoom">49%</span>
                    <button type="button" class="edit-studio-fullscreen" onclick="document.querySelector('.edit-studio-preview video, .edit-studio-preview img')?.requestFullscreen?.()">全屏</button>
                    ${preview}
                </div>
                <div class="edit-studio-playbar"><button type="button" onclick="document.getElementById('editStudioPreviewVideo')?.play?.()">▶</button><span>00:00:00</span></div>
                <div class="edit-studio-timeline">
                    <div class="edit-studio-ruler"><span></span><div>${markerList}<i class="edit-studio-playhead"></i></div></div>
                    <div class="edit-studio-track"><span>视频</span><div>${clipList}</div></div>
                    <div class="edit-studio-track"><span>分镜</span><div>${segments.map((item, i) => `<button class="edit-studio-clip ghost ${i===activeIndex?'active':''}" onclick="activeSegmentEditIndex=${i}; activeProductionFlowStep='edit'; renderSegments(currentSegments);">分镜${i+1}</button>`).join('')}</div></div>
                    <div class="edit-studio-tools"><button title="分割">✂</button><button title="删除">⌫</button><button title="复制">＋</button><button title="撤销">↶</button></div>
                </div>
            </section>
            <aside class="edit-studio-settings">
                <div class="edit-studio-panel-head"><strong>视频设置</strong><button type="button" onclick="showToast('已保持当前默认参数', 'info')">重置</button></div>
                <label>运动幅度<select><option>自动</option><option>弱</option><option>强</option></select></label>
                <div class="edit-studio-param-grid">
                    <label>水平运镜<input type="number" value="0"></label>
                    <label>垂直运镜<input type="number" value="0"></label>
                    <label>推拉运镜<input type="number" value="0"></label>
                    <label>旋转运镜<input type="number" value="0"></label>
                </div>
                <label>提示词<textarea rows="12" readonly>${escHtml(promptText || '先在 02 生成 Video Prompt')}</textarea></label>
                <div class="edit-studio-meta"><strong>${escHtml(title)}</strong><span>${duration}s · 全片约 ${totalDuration}s</span></div>
            </aside>
        </div>`;
}

function renderSegments(segments) {
    const list = document.getElementById('segmentsList');
    if (!list) return;
    if (activeProductionFlowStep === 'prompt') activeProductionFlowStep = 'script';
    syncProductionFlowLayout();
    const panelTitle = document.getElementById('storyboardPanelTitle');
    const rawResultPanel = document.getElementById('rawResultPanel');
    const panelFooter = document.getElementById('storyboardPanelFooter');
    const advancedActions = document.querySelectorAll('#storyboardPreviewActions .storyboard-advanced-action');

    if (!segments.length) {
        activeSegmentEditIndex = 0;
        list.innerHTML = '<div class="empty-state"><p>未解析到视频片段</p></div>';
        setWorkflowResultReady('script', false);
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    setWorkflowResultReady('script', true);
    setWorkflowOutputCollapsed('script', false);

    if ((activeProductionFlowStep || 'script') === 'script') {
        if (panelTitle) panelTitle.textContent = '台本 / Image Prompt / 分镜图';
        rawResultPanel?.classList.add('hidden');
        panelFooter?.classList.add('hidden');
        advancedActions.forEach(el => el.classList.add('hidden'));
        list.innerHTML = renderScriptPromptOverview(segments);
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    if (activeProductionFlowStep === 'prompt') {
        if (panelTitle) panelTitle.textContent = '🖼️ 生成分镜图';
        rawResultPanel?.classList.add('hidden');
        panelFooter?.classList.add('hidden');
        advancedActions.forEach(el => el.classList.add('hidden'));
        list.innerHTML = renderStoryboardImagePage(segments);
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    if (activeProductionFlowStep === 'image') {
        if (panelTitle) panelTitle.textContent = '生成 Video Prompt';
        rawResultPanel?.classList.add('hidden');
        panelFooter?.classList.add('hidden');
        advancedActions.forEach(el => el.classList.add('hidden'));
        list.innerHTML = renderVideoPromptPage(segments);
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    if (activeProductionFlowStep === 'video') {
        if (panelTitle) panelTitle.textContent = '生成视频';
        rawResultPanel?.classList.add('hidden');
        panelFooter?.classList.add('hidden');
        advancedActions.forEach(el => el.classList.add('hidden'));
        list.innerHTML = renderVideoGenerationPage(segments);
        initActiveSegmentEditors(segments[clampActiveSegmentEditIndex(segments)], clampActiveSegmentEditIndex(segments));
        ensureVideoEditorMentionEditor();
        refreshVideoEditorPreview();
        renderVideoEditorPendingEdit();
        renderVideoEditorUndoPanel();
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    if (activeProductionFlowStep === 'edit') {
        if (panelTitle) panelTitle.textContent = '编辑';
        rawResultPanel?.classList.add('hidden');
        panelFooter?.classList.add('hidden');
        advancedActions.forEach(el => el.classList.add('hidden'));
        list.innerHTML = renderVideoEditStudioPage(segments);
        renderWorkbenchDashboard();
        updateProductionTopBanner();
        return;
    }

    if (panelTitle) panelTitle.textContent = '📋 片段流水线';
    panelFooter?.classList.remove('hidden');
    advancedActions.forEach(el => el.classList.remove('hidden'));
    const activeIndex = clampActiveSegmentEditIndex(segments);
    const activeSeg = segments[activeIndex];
    const activeDuration = activeSeg?.duration || 5;
    list.innerHTML = `
        <div class="segment-workbench">
            <div class="segment-workbench-main">
                ${renderActiveSegmentDetail(activeSeg, activeIndex)}
            </div>
            <div class="segment-timeline-panel">
                <div class="segment-timeline-head">
                    <span>片段 ${activeIndex + 1} / ${segments.length}</span>
                    <span>${activeDuration}秒</span>
                </div>
                <div class="segment-timeline-list">
                    ${segments.map((seg, i) => renderSegmentTimelineItem(seg, i, activeIndex)).join('')}
                </div>
            </div>
        </div>`;

    initActiveSegmentEditors(activeSeg, activeIndex);
    renderWorkbenchDashboard();
    updateProductionTopBanner();
    if (activeProductionFlowStep !== 'script') autoCollapseWorkflowInput('script');
}

async function reprocessSingleSegment(index) {
    const seg = currentSegments[index];
    if (!seg?.id) { showToast('当前片段不存在', 'warning'); return; }

    const instructionRoot = document.getElementById(`segmentReprocessInstruction-${index}`);
    const instruction = readMentionEditorValue(instructionRoot).trim();
    if (!instruction) { showToast('请输入本片段的二次处理台本或要求', 'warning'); return; }

    const editor = document.getElementById(`segEditor-${index}`);
    const editorValue = editor ? readMentionEditorValue(editor) : '';
    const currentScript = (editorValue || seg._original || seg.prompt || seg.prompt_text || '').trim();
    if (!currentScript) { showToast('当前片段没有可二次处理的分镜剧本', 'warning'); return; }

    const btn = document.getElementById(`btnReprocessSegment-${index}`);
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> 二次处理中');
    startInlineFakeProgress(`reprocess-segment-${index}`, btn, `正在二次处理片段 ${index + 1}`, 90);

    try {
        const assetScope = getScopedAssetPayload(`${currentScript}\n${instruction}`, { segment: seg, fallbackToSelected: false });
        const res = await fetch(`/api/segments/${seg.id}/reprocess-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_script: currentScript,
                instruction,
                scenes: assetScope.scenes,
                characters: assetScope.characters,
                director_mode_id: document.getElementById('directorModeSelect')?.value || ''
            })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '二次处理失败', 'error');
            return;
        }

        const updatedSegment = data.segment || data;
        currentSegments[index] = { ...currentSegments[index], ...updatedSegment };
        currentSegments[index].prompt = updatedSegment.prompt_text || updatedSegment.prompt || data.result || currentSegments[index].prompt || '';
        currentSegments[index].prompt_text = currentSegments[index].prompt;
        currentSegments[index]._genStatus = statusToGenStatus(currentSegments[index].status || 'ready');
        normalizeSegmentState(currentSegments[index]);
        document.getElementById('resultContent').textContent = currentSegments.map(s => s.prompt || s.prompt_text || '').join('\n\n===VIDEO_SPLIT===\n\n');
        renderSegments(currentSegments);
        syncStoryboardPromptToggle();
        showToast(`片段 ${index + 1} 二次处理完成`, 'success');
    } catch (e) {
        showToast('请求失败: ' + e.message, 'error');
    } finally {
        stopInlineFakeProgress(`reprocess-segment-${index}`);
        resetBtn();
    }
}

function renderControlDataBlock(seg, i) {
    normalizeSegmentState(seg);
    const data = seg.control_data || null;
    if (!data || (typeof data === 'object' && !Object.keys(data).length)) return '';
    const jsonText = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const characterCount = Array.isArray(data?.characters) ? data.characters.length : 0;
    return `
        <div class="storyboard-block control-data-block">
            <div class="storyboard-block-header">
                <div>
                    <div class="storyboard-title">🎥 3D摄影控制数据</div>
                    <div class="storyboard-hint">该数据不会写入上方视频提示词，只用于导入3D截图模式生成角色站位与摄像机角度。</div>
                </div>
                <span class="storyboard-status prompt_ready">${characterCount}个角色</span>
            </div>
            <pre class="result-content" style="max-height:180px;white-space:pre-wrap">${escHtml(jsonText)}</pre>
            <div class="storyboard-actions">
                <button class="btn btn-sm btn-primary" onclick="importSegmentControlDataToReference3D(${i})">🧊 导入3D摄影模式</button>
                <button class="btn btn-sm btn-secondary" onclick="copyControlDataToClipboard(${i})">复制控制数据</button>
            </div>
        </div>`;
}

function renderStoryboardBlock(seg, i) {
    normalizeSegmentState(seg);
    const prompt = seg.storyboard_prompt || '';
    const imagePath = seg.storyboard_image_path || '';
    const status = seg.storyboard_status || (prompt ? 'prompt_ready' : 'not_ready');
    const statusText = {
        not_ready: '未生成',
        prompt_ready: '提示词就绪',
        legacy_prompt: '旧格式待重生',
        generating: '生成中',
        image_ready: '图片就绪',
        failed: '失败'
    }[status] || status;
    const hasPrompt = !!prompt.trim();
    const failed = status === 'failed';
    const promptTools = `
        <details class="collapsible-panel secondary-edit-panel segment-secondary-edit-panel" ${failed || !hasPrompt ? 'open' : ''}>
            <summary class="collapsible-panel-summary">
                <span>Image Prompt</span>
                <span class="badge">可编辑</span>
            </summary>
            <div class="collapsible-panel-body">
                <textarea class="storyboard-prompt-editor" id="storyboardPrompt-${i}" rows="6" placeholder="当前片段的 Image Prompt：按格写清镜头、人物站位、动作，并标明每句台词对应哪一格；画面禁止字幕和对白框。" onblur="saveStoryboardPromptEdit(${i})">${escHtml(prompt)}</textarea>
                <div class="storyboard-actions">
                    <button class="btn btn-sm btn-secondary" onclick="generateStoryboardPrompt(${i})">重新生成 Image Prompt</button>
                    <button class="btn btn-sm btn-secondary" onclick="regenerateStoryboardImage(${i})">按 Image Prompt 重新生成图</button>
                </div>
            </div>
        </details>`;
    const retryActions = `
        <div class="storyboard-actions">
            <button class="btn btn-sm btn-primary" onclick="regenerateStoryboardImage(${i})">${hasPrompt ? '重新生成分镜图' : '生成 Image Prompt 并出图'}</button>
            <button class="btn btn-sm btn-secondary" onclick="regenerateStoryboardImage(${i}, { regeneratePrompt: true })">重新生成 Image Prompt 并出图</button>
        </div>`;
    return `
        <div class="storyboard-block ${imagePath ? 'has-image' : ''}">
            <div class="storyboard-block-header">
                <div>
                    <div class="storyboard-title">🖼️ 分镜图</div>
                    <div class="storyboard-hint">由 Image Prompt 生成，用来锁定构图、站位、动作方向和台词格位；编辑时会带当前图和提示词重新生成。</div>
                </div>
                <span class="storyboard-status ${escAttr(status)}">${escHtml(statusText)}</span>
            </div>
            ${imagePath ? `
                <div class="storyboard-preview">
                    <img src="/${escAttr(imagePath)}" alt="片段${i + 1}分镜图">
                    <div class="local-path">当前分镜图：${escHtml(imagePath)}。生成视频时会作为核心参考图输入。</div>
                </div>
                <div class="storyboard-edit-box">
                    <label>编辑提示词</label>
                    <textarea class="storyboard-prompt-editor" id="storyboardEditPrompt-${i}" rows="4" placeholder="输入要修改的内容，例如：第3格改成近景眼神特写；保持其他格子不变" oninput="currentSegments[${i}]._storyboardEditPrompt = this.value">${escHtml(seg._storyboardEditPrompt || '')}</textarea>
                    <div class="storyboard-actions">
                        <button class="btn btn-sm btn-primary" onclick="editStoryboardImage(${i})">✏️ 上传当前图并重新生成</button>
                        <a class="btn btn-sm btn-secondary" href="/${escAttr(imagePath)}" target="_blank">查看大图</a>
                        <button class="btn btn-sm btn-danger" onclick="deleteStoryboardFrame(${i}, 'start')">删除分镜图</button>
                    </div>
                    <div class="field-hint">编辑时会把当前分镜图作为第一张参考图，并把这段编辑提示词一起提交；成功后自动覆盖当前分镜图。</div>
                </div>` : ''}
            ${!imagePath ? `
                <div class="storyboard-edit-box">
                    <div class="field-hint">${failed ? '分镜图生成失败，可以减少参考图、压缩图片或简化 Image Prompt 后重试。' : '当前片段还没有分镜图。主线会先生成 Image Prompt，再用它出分镜图；如果自动生成失败，可在这里重新生成。'}</div>
                    ${retryActions}
                </div>` : ''}
            ${promptTools}
            ${seg.continuity_notes ? `<div class="storyboard-notes">${escHtml(seg.continuity_notes)}</div>` : ''}
        </div>`;
}

function getSegmentCacheKey(seg) {
    return seg?.id || seg?._taskId || seg?.task_id || '';
}

function cacheSegmentProgress(seg) {
    const key = getSegmentCacheKey(seg);
    if (!key) return;
    segmentProgressCache.set(key, {
        _genStatus: seg._genStatus,
        _progressPercent: seg._progressPercent,
        _progressText: seg._progressText,
        _progressStartedAt: seg._progressStartedAt,
        _taskId: seg._taskId,
        _videoUrl: seg._videoUrl,
        _localVideoPath: seg._localVideoPath
    });
}

function applyCachedSegmentProgress(seg) {
    const key = getSegmentCacheKey(seg);
    if (!key || !segmentProgressCache.has(key)) return;
    Object.assign(seg, segmentProgressCache.get(key));
}

function normalizeSegmentState(seg) {
    if (!seg.prompt && seg.prompt_text) seg.prompt = seg.prompt_text;
    if (!seg._original) {
        const initialPrompt = seg.prompt || seg.prompt_text || '';
        seg._original = seg.source_script || (isGeneratedVideoPromptText(initialPrompt) ? '' : initialPrompt);
    }
    if (!seg._videoPromptDirty && isGeneratedVideoPromptText(seg.prompt || seg.prompt_text || '', seg)) {
        seg._videoPromptDirty = true;
    }
    if (isLegacyStoryboardPrompt(seg.storyboard_prompt)) {
        seg._legacyStoryboardPrompt = seg.storyboard_prompt;
        seg.storyboard_prompt = '';
        seg.storyboard_status = 'legacy_prompt';
        seg.continuity_notes = '旧版 Image Prompt 已隐藏；请点击生成 Image Prompt，系统会按新格式重新生成。';
    }
    if (!seg._libraryImages) {
        try {
            seg._libraryImages = Array.isArray(seg.reference_images) ? seg.reference_images : JSON.parse(seg.reference_images || '[]');
        } catch (e) {
            seg._libraryImages = [];
        }
    }
    if (!seg._mode) seg._mode = (seg._libraryImages || []).length ? 'omni_reference' : 'text_to_video';
    if (seg.task_id && !seg._taskId) seg._taskId = seg.task_id;
    if ((seg.video_url || '').startsWith('http') && !seg._videoUrl) seg._videoUrl = seg.video_url;
    if (seg.local_video_path && !seg._localVideoPath) seg._localVideoPath = seg.local_video_path;
    if (!seg.duration && seg.duration !== 0) seg.duration = 5;
    if (!seg.storyboard_count && seg.storyboard_count !== 0) seg.storyboard_count = seg.storyboard_count || 0;
    if (!seg.storyboard_prompt) seg.storyboard_prompt = seg.storyboard_prompt || '';
    if (!seg.storyboard_image_path) seg.storyboard_image_path = seg.storyboard_image_path || '';
    if (!seg.storyboard_status) seg.storyboard_status = seg.storyboard_status || '';
    if (!seg.end_storyboard_prompt) seg.end_storyboard_prompt = seg.end_storyboard_prompt || '';
    if (!seg.end_storyboard_image_path) seg.end_storyboard_image_path = seg.end_storyboard_image_path || '';
    if (!seg.end_storyboard_status) seg.end_storyboard_status = seg.end_storyboard_status || '';
    if (!seg._storyboardReferenceImages) seg._storyboardReferenceImages = Array.isArray(seg._libraryImages) ? [...seg._libraryImages] : [];
    if (typeof seg.control_data === 'string') {
        const raw = seg.control_data.trim();
        if (raw) {
            try {
                seg.control_data = JSON.parse(raw);
            } catch (e) {
                seg.control_data = { raw };
            }
        } else {
            seg.control_data = null;
        }
    }
    if ((seg.status === 'completed' || seg.status === 'failed' || seg.status === 'generating') && !seg._genStatus) {
        seg._genStatus = seg.status === 'completed' ? 'completed' : seg.status;
    }
    applyCachedSegmentProgress(seg);
}

async function saveSegmentState(index, extra = {}, options = {}) {
    const seg = currentSegments[index];
    if (!seg?.id) return;
    const editor = document.getElementById(`segEditor-${index}`);
    const durationInput = document.getElementById(`segDuration-${index}`);
    const prompt = ((editor ? readMentionEditorValue(editor) : '') || seg.prompt || seg.prompt_text || '').trim();
    if (prompt) seg.prompt = prompt;
    if (!options.skipStoryboardPrompt) {
        const storyboardPromptEl = document.getElementById(`storyboardPrompt-${index}`);
        const storyboardPrompt = (storyboardPromptEl ? storyboardPromptEl.value : (seg.storyboard_prompt || '')).trim();
        if (storyboardPrompt) seg.storyboard_prompt = storyboardPrompt;
    }
    seg.end_storyboard_prompt = '';
    seg.end_storyboard_status = '';
    const duration = normalizeVideoDuration(durationInput?.value || seg.duration || 5);
    seg.duration = duration;
    const payload = {
        prompt_text: prompt,
        duration,
        reference_images: seg._libraryImages || [],
        control_data: seg.control_data || null,
        ...extra
    };
    if (!options.skipStoryboardPrompt) {
        payload.storyboard_prompt = seg.storyboard_prompt || '';
        payload.storyboard_status = seg.storyboard_status || '';
    }
    try {
        await fetch(`/api/segments/${seg.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn('保存片段状态失败:', e);
    }
}

async function deleteStoryboardFrame(index, framePosition = 'start') {
    const seg = currentSegments[index];
    if (!seg?.id) return;
    const isEnd = false;
    const imagePath = seg.storyboard_image_path;
    if (!imagePath) return;
    if (!confirm(`确定删除片段 ${index + 1} 的分镜图？删除后生成视频时不会再作为参考图。`)) return;

    seg.storyboard_image_path = '';
    seg.storyboard_status = seg.storyboard_prompt ? 'prompt_ready' : '';
    seg.end_storyboard_image_path = '';
    seg.end_storyboard_status = '';
    seg.continuity_notes = '分镜图已删除；生成视频时不会再作为参考图输入。';

    await saveSegmentState(index, {
        storyboard_image_path: '',
        storyboard_status: seg.storyboard_status,
        end_storyboard_image_path: '',
        end_storyboard_status: '',
        continuity_notes: seg.continuity_notes,
    });
    renderSegments(currentSegments);
    renderStoryboardOnlyList(currentSegments);
    showToast('分镜图已删除，不会再作为视频参考图', 'success');
}

function mergeStoryboardFrameSegment(index, incomingSegment, framePosition, fallbackSeg = {}) {
    const incoming = incomingSegment || {};
    const latest = currentSegments[index] || fallbackSeg || {};
    const merged = { ...latest };
    const isEnd = framePosition === 'end';

    // 后返回的接口数据是“整行片段”，这里只接收本次故事板任务对应字段，避免覆盖页面上的最新编辑。
    const commonFields = [
        'id', 'project_id', 'segment_index', 'prompt_text', 'scene_id', 'character_ids',
        'status', 'video_url', 'local_video_path', 'task_id', 'reference_images', 'duration',
        'storyboard_count', 'created_at', 'updated_at'
    ];
    commonFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(incoming, field)) merged[field] = incoming[field];
    });

    const targetFields = isEnd
        ? ['end_storyboard_prompt', 'end_storyboard_image_path', 'end_storyboard_status']
        : ['storyboard_prompt', 'storyboard_image_path', 'storyboard_status'];
    const otherFields = isEnd
        ? ['storyboard_prompt', 'storyboard_image_path', 'storyboard_status']
        : ['end_storyboard_prompt', 'end_storyboard_image_path', 'end_storyboard_status'];

    targetFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(incoming, field)) merged[field] = incoming[field] || '';
    });
    otherFields.forEach(field => {
        if ((merged[field] === undefined || merged[field] === null || merged[field] === '')
            && Object.prototype.hasOwnProperty.call(incoming, field)) {
            merged[field] = incoming[field] || '';
        }
    });

    if (Object.prototype.hasOwnProperty.call(incoming, 'continuity_notes')) {
        merged.continuity_notes = incoming.continuity_notes || merged.continuity_notes || '';
    }
    merged.prompt = incoming.prompt_text || latest.prompt || latest.prompt_text || fallbackSeg.prompt || '';

    currentSegments[index] = merged;
    normalizeSegmentState(currentSegments[index]);
    return currentSegments[index];
}

function statusToGenStatus(status) {
    if (status === 'completed') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'generating') return 'generating';
    return 'idle';
}

function getReferenceItems() {
    const charItems = characters
        .filter(c => c.image_path)
        .map(c => ({ type: 'char', id: c.id, name: `人物：${c.name}`, image_path: c.image_path }));
    const sceneItems = scenes
        .filter(s => s.image_path)
        .map(s => ({ type: 'scene', id: s.id, name: `场景：${s.name}`, image_path: s.image_path }));
    return charItems.concat(sceneItems);
}

function getReferenceLabelByPath(imagePath) {
    const ref = getReferenceItems().find(item => item.image_path === imagePath);
    if (ref) return ref.name;
    return imagePath?.split('/')?.pop() || '未知参考图';
}

function getVideoStoryboardReferenceLabels(seg) {
    const labels = [];
    if (seg?.storyboard_image_path && isStoryboardModeEnabled()) labels.push('分镜图');
    if (seg?.end_storyboard_image_path && isStoryboardModeEnabled()) labels.push('尾帧分镜图');
    return labels;
}

function getOrderedSelectedReferences(seg) {
    normalizeSegmentState(seg);
    const selectedSet = new Set(seg._libraryImages || []);
    const ordered = getReferenceItems()
        .map(ref => ref.image_path)
        .filter(path => selectedSet.has(path));
    const remaining = (seg._libraryImages || []).filter(path => !ordered.includes(path));
    return ordered.concat(remaining);
}

function getReferenceOrderSummary(index) {
    const seg = currentSegments[index];
    if (!seg) return '';
    const libraryRefs = getOrderedSelectedReferences(seg);
    const uploadCount = document.getElementById(`segFile-${index}`)?.files?.length || seg._uploadFileCount || 0;
    const storyboardLabels = getVideoStoryboardReferenceLabels(seg);
    if (!libraryRefs.length && !uploadCount && !storyboardLabels.length) return '当前未选择参考图';
    const libraryText = libraryRefs.map((path, i) => `[图${i + 1}] ${getReferenceLabelByPath(path)}`).join('；');
    const storyboardText = storyboardLabels.map(label => `${label}（自动附加，不占用提示词[图N]编号）`).join('；');
    const uploadText = Array.from({ length: uploadCount }, (_, i) => `临时上传图${i + 1}（追加在图库参考图之后）`).join('；');
    return [libraryText, storyboardText, uploadText].filter(Boolean).join('；');
}

function updateSegmentReferenceSummary(index) {
    const input = document.getElementById(`segFile-${index}`);
    const countEl = document.getElementById(`segFileCount-${index}`);
    if (countEl) countEl.textContent = `${input?.files?.length || currentSegments[index]?._uploadFileCount || 0}张 · ${getReferenceOrderSummary(index)}`;
}

function renderReferenceChoices(segIndex, selectedRefs) {
    const refs = getReferenceItems();
    if (!refs.length) {
        return '<span class="segment-ref-empty">图库暂无图片，可直接上传参考图</span>';
    }
    return refs.map(ref => {
        const selected = selectedRefs.includes(ref.image_path);
        return `
            <label class="segment-ref-chip ${selected ? 'selected' : ''}">
                <input type="checkbox" ${selected ? 'checked' : ''} onchange="toggleSegmentReference(${segIndex}, '${escAttr(ref.image_path)}', this)">
                <img src="/${escAttr(ref.image_path)}" alt="${escAttr(ref.name)}">
                <span>${escHtml(ref.name)}</span>
            </label>`;
    }).join('');
}

function toggleSegmentReference(index, imagePath, input) {
    const seg = currentSegments[index];
    if (!seg) return;
    normalizeSegmentState(seg);
    const refs = new Set(seg._libraryImages || []);
    if (input.checked) refs.add(imagePath);
    else refs.delete(imagePath);
    seg._libraryImages = getReferenceItems()
        .map(ref => ref.image_path)
        .filter(path => refs.has(path));
    input.closest('.segment-ref-chip')?.classList.toggle('selected', input.checked);
    updateSegmentReferenceSummary(index);
    saveSegmentState(index);
}

function getStoryboardReferenceSelection(seg) {
    normalizeSegmentState(seg);
    const selectedSet = new Set(seg._storyboardReferenceImages || []);
    const ordered = getReferenceItems()
        .map(ref => ref.image_path)
        .filter(path => selectedSet.has(path));
    const remaining = (seg._storyboardReferenceImages || []).filter(path => !ordered.includes(path));
    return ordered.concat(remaining);
}

function renderStoryboardReferenceChoices(segIndex, selectedRefs) {
    const refs = getReferenceItems();
    if (!refs.length) {
        return '<span class="segment-ref-empty">人物库/场景库暂无图片，可直接上传参考图</span>';
    }
    return refs.map(ref => {
        const selected = selectedRefs.includes(ref.image_path);
        return `
            <label class="segment-ref-chip ${selected ? 'selected' : ''}">
                <input type="checkbox" ${selected ? 'checked' : ''} onchange="toggleStoryboardReference(${segIndex}, '${escAttr(ref.image_path)}', this)">
                <img src="/${escAttr(ref.image_path)}" alt="${escAttr(ref.name)}">
                <span>${escHtml(ref.name)}</span>
            </label>`;
    }).join('');
}

function toggleStoryboardReference(index, imagePath, input) {
    const seg = currentSegments[index];
    if (!seg) return;
    normalizeSegmentState(seg);
    const refs = new Set(seg._storyboardReferenceImages || []);
    if (input.checked) refs.add(imagePath);
    else refs.delete(imagePath);
    seg._storyboardReferenceImages = getReferenceItems()
        .map(ref => ref.image_path)
        .filter(path => refs.has(path));
    input.closest('.segment-ref-chip')?.classList.toggle('selected', input.checked);
    updateStoryboardReferenceSummary(index);
}

function getStoryboardReferenceSummary(index) {
    const seg = currentSegments[index];
    if (!seg) return '当前未选择参考图';
    const refs = getStoryboardReferenceSelection(seg);
    const uploadCount = document.getElementById(`storyboardFile-${index}`)?.files?.length || seg._storyboardUploadFileCount || 0;
    if (!refs.length && !uploadCount) return '当前未选择参考图';
    const libraryText = refs.map((path, i) => `[参考${i + 1}] ${getReferenceLabelByPath(path)}`).join('；');
    const uploadText = Array.from({ length: uploadCount }, (_, i) => `分镜临时上传图${i + 1}`).join('；');
    return [libraryText, uploadText].filter(Boolean).join('；');
}

function updateStoryboardReferenceSummary(index) {
    const summary = getStoryboardReferenceSummary(index);
    const summaryEl = document.getElementById(`storyboardRefSummary-${index}`);
    const countEl = document.getElementById(`storyboardFileCount-${index}`);
    const input = document.getElementById(`storyboardFile-${index}`);
    if (summaryEl) {
        summaryEl.textContent = summary;
        summaryEl.classList.toggle('hidden', summary === '当前未选择参考图');
    }
    if (countEl) {
        countEl.textContent = `${input?.files?.length || currentSegments[index]?._storyboardUploadFileCount || 0}张 · ${summary}`;
        countEl.classList.toggle('hidden', false);
    }
}

function onStoryboardFilesChange(index) {
    const input = document.getElementById(`storyboardFile-${index}`);
    const seg = currentSegments[index];
    if (seg) seg._storyboardUploadFileCount = input?.files?.length || 0;
    updateStoryboardReferenceSummary(index);
}

function onSegmentFilesChange(index) {
    const input = document.getElementById(`segFile-${index}`);
    const seg = currentSegments[index];
    if (seg) seg._uploadFileCount = input?.files?.length || 0;
    updateSegmentReferenceSummary(index);
}

function onSegModeChange(index) {
    const mode = document.getElementById(`segMode-${index}`).value;
    currentSegments[index]._mode = mode;
    const wrap = document.getElementById(`segRefWrap-${index}`);
    if (mode === 'text_to_video') {
        wrap.classList.add('hidden');
    } else {
        wrap.classList.remove('hidden');
    }
    saveSegmentState(index);
}

function toggleRawView() {
    const panel = document.getElementById('rawResultPanel');
    panel.classList.toggle('hidden');
}

function resetSegment(index) {
    const seg = currentSegments[index];
    if (!seg || !seg._original) return;
    const editor = document.getElementById(`segEditor-${index}`);
    if (editor) writeMentionEditorValue(editor, seg._original);
    showToast('已还原到原始内容', 'info');
}

function splitSegment(index) {
    const editor = document.getElementById(`segEditor-${index}`);
    if (!editor) return;
    const text = readMentionEditorValue(editor).trim();
    const mid = Math.floor(text.length / 2);
    // 在中间位置附近找换行符作为分割点
    let splitPos = text.indexOf('\n', mid - 50);
    if (splitPos < 0 || splitPos > mid + 50) splitPos = mid;

    const part1 = text.substring(0, splitPos).trim();
    const part2 = text.substring(splitPos).trim();

    if (!part1 || !part2) {
        showToast('内容太短，无法拆分', 'warning');
        return;
    }

    // 替换当前片段并插入新片段
    currentSegments[index].prompt = part1;
    currentSegments[index]._original = currentSegments[index]._original || part1;
    currentSegments.splice(index + 1, 0, {
        prompt: part2,
        _original: part2,
        scene: '',
        characters: []
    });

    document.getElementById('segmentCount').textContent = `${currentSegments.length}个Image段落`;
    renderSegments(currentSegments);
    renderStoryboardOnlyList(currentSegments);
    showToast(`片段 ${index + 1} 已拆分为两个片段`, 'success');
}

function deleteSegment(index) {
    if (currentSegments.length <= 1) {
        showToast('至少保留一个片段', 'warning');
        return;
    }
    if (!confirm(`确定删除片段 ${index + 1}？`)) return;
    currentSegments.splice(index, 1);
    document.getElementById('segmentCount').textContent = `${currentSegments.length}个Image段落`;
    renderSegments(currentSegments);
    showToast('片段已删除', 'success');
}

async function processStoryboardOnly() {
    const script = document.getElementById('storyboardScriptInput')?.value?.trim() || '';
    if (!currentProject || !currentSegments.length) {
        if (script) {
            const videoInput = document.getElementById('scriptInput');
            if (videoInput && !videoInput.value.trim()) {
                videoInput.value = script;
                videoInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        showToast('请先在“制片流水线”生成 Image Prompt 片段，再回填分镜图提示词', 'warning');
        switchToTab('script');
        return;
    }
    const btn = document.getElementById('btnStoryboardProcess');
    const resetBtn = setButtonBusy(btn, '<span class="btn-icon">⏳</span> 生成中，可继续操作');
    startInlineFakeProgress('storyboard-only-process', btn, '正在按当前分段逐段生成 Image Prompt', 120);
    showToast('将按当前已切分片段逐段生成 Image Prompt 并自动回填', 'info');
    setWorkflowResultEmpty('storyboard');
    try {
        await generateAllStoryboardPrompts();
        document.getElementById('storyboardOnlyPlaceholderCard')?.classList.add('hidden');
        document.getElementById('storyboardOnlyPanel')?.classList.remove('hidden');
        document.getElementById('storyboardOnlyCount').textContent = `${currentSegments.length}个分镜`;
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        await loadProjects();
        currentProjectInfo = projectsCache.find(p => p.id === currentProject) || currentProjectInfo;
        updateCurrentProjectBar();
        showToast(`已为 ${currentSegments.length} 个片段生成并回填 Image Prompt`, 'success');
    } catch (e) {
        showToast('分镜生成请求失败: ' + e.message, 'error');
    } finally {
        stopInlineFakeProgress('storyboard-only-process');
        resetBtn();
    }
}

function renderStoryboardOnlyList(segments) {
    const list = document.getElementById('storyboardOnlyList');
    if (!list) return;
    if (!segments.length) {
        list.innerHTML = '<div class="empty-state"><p>未生成分镜</p></div>';
        setWorkflowResultReady('storyboard', false);
        return;
    }
    list.innerHTML = segments.map((seg, i) => {
        normalizeSegmentState(seg);
        return `
            <div class="segment-item" id="storyboard-only-${i}">
                <div class="segment-header">
                    <span class="segment-title">🖼️ 分镜 ${i + 1}</span>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                        ${seg.scene ? `<span class="badge" style="font-size:11px">📍 ${escHtml(seg.scene)}</span>` : ''}
                        <span class="badge" style="font-size:11px">${escHtml(seg.storyboard_status || 'prompt_ready')}</span>
                    </div>
                </div>
                ${renderStoryboardBlock(seg, i)}
            </div>`;
    }).join('');
    autoCollapseWorkflowInput('storyboard');
}

async function generateStoryboardPrompt(index, options = {}) {
    const seg = currentSegments[index];
    if (!seg?.id) {
        const segmentText = getSegmentSourceText(seg);
        const assetScope = getScopedAssetPayload(segmentText, { segment: seg, fallbackToSelected: false });
        const fallbackPrompt = segmentText ? buildLocalStoryboardPrompt(index, segmentText, assetScope) : '';
        if (!fallbackPrompt) {
            showToast('请先生成片段流水线内容后再生成 Image Prompt', 'warning');
            return false;
        }
        currentSegments[index] = {
            ...seg,
            duration: estimateSegmentDurationSeconds(segmentText),
            prompt: segmentText,
            prompt_text: segmentText,
            source_script: segmentText,
            _original: segmentText,
            storyboard_prompt: fallbackPrompt,
            storyboard_status: 'prompt_ready',
            continuity_notes: '本片段按前端估时规则切出，已本地生成 Image Prompt；如需直接生成分镜图，请重新执行第一页保存片段。'
        };
        normalizeSegmentState(currentSegments[index]);
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast(`片段 ${index + 1} 已按当前短段落本地生成 Image Prompt`, 'success');
        return true;
    }
    const editor = document.getElementById(`segEditor-${index}`);
    if (editor) {
        seg.prompt = readMentionEditorValue(editor).trim();
        await saveSegmentState(index, {}, { skipStoryboardPrompt: true });
    }
    const framePosition = 'start';
    const frameLabel = 'Image Prompt';
    const oldStoryboardPrompt = seg.storyboard_prompt || '';
    seg.storyboard_prompt = '';
    seg.storyboard_status = 'generating';
    seg.continuity_notes = '正在重新生成 Image Prompt，不会复用当前输入框中的旧提示词。';
    renderSegments(currentSegments);
    renderStoryboardOnlyList(currentSegments);
    if (!options.silentLoading) {
        const progressAnchor = document.querySelector(`#storyboardPrompt-${index}`)?.closest('.storyboard-block, .script-prompt-feature, .storyboard-image-prompt-panel');
        startInlineFakeProgress(`storyboard-prompt-${framePosition}-${index}`, progressAnchor, `正在生成片段 ${index + 1} ${frameLabel}提示词`, 60);
    }
    if (!options.silentLoading) showToast(`片段 ${index + 1} ${frameLabel}提示词生成任务已提交，可继续操作`, 'info');
    try {
        const segmentText = getSegmentSourceText(seg);
        if (!segmentText) {
            seg.storyboard_prompt = oldStoryboardPrompt;
            seg.storyboard_status = oldStoryboardPrompt ? 'prompt_ready' : 'failed';
            renderSegments(currentSegments);
            renderStoryboardOnlyList(currentSegments);
            if (!options.silentLoading) showToast(`片段 ${index + 1} 没有原台词分段，无法生成 Image Prompt`, 'warning');
            return false;
        }
        const assetScope = getScopedAssetPayload(segmentText, { segment: seg, fallbackToSelected: false });
        const scopedInstruction = [
            getMainlineStoryboardPromptInstruction(),
            buildAssetScopeInstruction(assetScope, `片段${index + 1}`),
            options.retryCleanFormat ? getStoryboardPromptFormatRetryInstruction() : '',
            `当前片段原台词/舞台指示如下，只能根据这一段生成 Image Prompt，不要引用其他片段：\n${segmentText}`
        ].join('\n\n');
        await saveSegmentState(index, {
            scene_id: assetScope.scenes[0] || '',
            character_ids: JSON.stringify(assetScope.characters)
        }, { skipStoryboardPrompt: true });
        const res = await fetch(`/api/segments/${seg.id}/reprocess-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_script: segmentText,
                scenes: assetScope.scenes,
                characters: assetScope.characters,
                director_mode_id: document.getElementById('directorModeSelect')?.value || '',
                instruction: scopedInstruction
            })
        });
        const data = await res.json();
        let updatedSegment = {};
        let updatedPrompt = '';
        if (res.ok) {
            updatedSegment = data.segment || data;
            updatedPrompt = (
                updatedSegment.prompt_text ||
                updatedSegment.prompt ||
                updatedSegment.storyboard_prompt ||
                data.result ||
                data.storyboard_prompt ||
                ''
            ).trim();
        } else {
            console.warn('Image Prompt 模型生成失败，使用本地新格式兜底。', data);
        }
        if (updatedPrompt && isLegacyStoryboardPrompt(updatedPrompt) && !options.retryCleanFormat) {
            console.warn('Image Prompt 返回旧网页模板格式，自动重试一次新格式。', { index });
            return generateStoryboardPrompt(index, { ...options, retryCleanFormat: true });
        }
        if (!updatedPrompt || !isTargetStoryboardPromptFormat(updatedPrompt)) {
            updatedPrompt = buildLocalStoryboardPrompt(index, segmentText, assetScope);
        }
        currentSegments[index] = {
            ...seg,
            ...updatedSegment,
            storyboard_prompt: updatedPrompt,
            storyboard_status: 'prompt_ready',
            prompt: segmentText,
            prompt_text: segmentText,
            source_script: segmentText,
            _original: segmentText,
            continuity_notes: 'Image Prompt 已按新格式生成。'
        };
        normalizeSegmentState(currentSegments[index]);
        await saveSegmentState(index, {
            prompt_text: segmentText,
            scene_id: assetScope.scenes[0] || '',
            character_ids: JSON.stringify(assetScope.characters),
            storyboard_prompt: updatedPrompt,
            storyboard_status: 'prompt_ready',
            continuity_notes: currentSegments[index].continuity_notes
        }, { skipStoryboardPrompt: true });
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        if (!options.silentLoading) showToast(`片段 ${index + 1} ${frameLabel}提示词已生成`, 'success');
        return true;
    } catch (e) {
        const segmentText = getSegmentSourceText(seg);
        const assetScope = getScopedAssetPayload(segmentText, { segment: seg, fallbackToSelected: false });
        const fallbackPrompt = segmentText ? buildLocalStoryboardPrompt(index, segmentText, assetScope) : '';
        seg.storyboard_prompt = fallbackPrompt;
        seg.storyboard_status = fallbackPrompt ? 'prompt_ready' : 'failed';
        seg.continuity_notes = fallbackPrompt ? '模型请求失败，已使用新格式本地兜底生成。' : 'Image Prompt 请求失败: ' + e.message;
        if (fallbackPrompt) {
            await saveSegmentState(index, {
                prompt_text: segmentText,
                storyboard_prompt: fallbackPrompt,
                storyboard_status: 'prompt_ready',
                continuity_notes: seg.continuity_notes
            }, { skipStoryboardPrompt: true });
        }
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast(fallbackPrompt ? `片段 ${index + 1} 已用新格式生成 Image Prompt` : 'Image Prompt 请求失败: ' + e.message, fallbackPrompt ? 'warning' : 'error');
        return !!fallbackPrompt;
    } finally {
        if (!options.silentLoading) stopInlineFakeProgress(`storyboard-prompt-${framePosition}-${index}`);
    }
}

function getMainlineStoryboardPromptInstruction() {
    return [
        '当前请求只为一个已切分好的15秒以内片段生成一条 Image 2 分格分镜图提示词；只以本次 source_script/当前片段文本为唯一剧情依据。',
        '必须输出一条自然中文、可直接复制给图像模型的成品 Image Prompt，不要输出分析、Markdown、表格、列表解释或网页字段。',
        '强制采用这一类成品结构：参考图对应：【图1】角色A，【图2】角色B。生成单张六格动态分镜表，当前地点/场景，21:9或16:9，三乘二清晰分格，每格内部按16:9构图，角落仅保留极小黑色编号01-06；偏古风3D动画预演分镜，干净高调黑白灰阶，明亮灰白底，单色石墨线稿叠加柔和体积明暗，环境细节密集但画面干净，角色有立体体积感和可读剪影，半写实古风比例，自然五官，克制表情，不要大眼萌系或幼态卡通脸，电影感构图，前景遮挡，倾斜透视，动态调度，可见镜头路径箭头、身体重心线、情绪冲击线。',
        '必须写“根据以下剧情转化镜头，不复述台词：”后面接一句视觉剧情概括。这里禁止逐字复述对白，只把对白转换成可见动作、口型、表情、视线、站位和情绪转折。',
        '只允许这些主要段落标签：参考图对应、角色锁、背景锁、01、02、03、04、05、06、负面提示。严禁出现旧网页模板标题：固定视觉风格、分镜分格要求、原始台本依据、当前镜头内容、逐格镜头要求。',
        '普通对白、户外、城市、队伍移动、城门、街道、探索场景默认六格；室外六格优先21:9，室内六格优先16:9。每格必须是独立导演镜头，01建立环境，04视觉转折特写，06收束到行动目标或情绪落点。',
        '角色锁必须只包含当前片段实际出现的人物；背景锁只包含当前片段实际地点和连续性锚点；禁止把整个人物库、整套场景库、其他片段剧情或未出现角色写入提示词。',
        '01-06每格写一整句：镜头景别/机位/角度/运动 + 前景中景背景 + 人物动作表演 + 空间锚点 + 红/蓝/绿/橙/紫导演标注。相邻格必须改变机位高度、景别、轴线、主体尺度、运动方向或前景遮挡。',
        '负面提示放在结尾，压缩但完整覆盖：不要静态合照、横向排队式主角站位、平视中景连用、居中全身展示、无分格插画、重复机位、空背景、人物漂浮、真实照片、网页截图、软件界面、现代素材、彩色动漫/彩色3D成片、脏灰雾、Q版大眼、对白框、字幕、长说明、水印、UI、角色变形、背景漂移、空间断裂、重复同高度同方向同焦段。'
    ].join('\n');
}

async function generateAllStoryboardPrompts() {
    if (!currentProject || !currentSegments.length) {
        showToast('当前没有可生成的分镜片段', 'warning');
        return;
    }
    const btn = document.querySelector('.script-prompt-generate-all') || document.querySelector('[onclick="generateAllStoryboardPrompts()"]');
    const resetBtn = setButtonBusy(btn, '⏳ 生成中');
    startInlineFakeProgress('all-storyboard-prompts', btn, '正在逐段生成 Image Prompt', 180);
    showToast('已开始逐段生成 Image Prompt，请等待完成后自动回填', 'info');
    try {
        const queue = currentSegments.map((seg, index) => ({ seg, index })).filter(item => getSegmentSourceText(item.seg));
        const results = new Array(queue.length).fill(false);
        let cursor = 0;
        const concurrency = Math.min(2, queue.length);
        async function runNextPrompt() {
            while (cursor < queue.length) {
                const taskIndex = cursor;
                cursor += 1;
                const { index } = queue[taskIndex];
                updateInlineFakeProgress('all-storyboard-prompts', Math.min(90, 12 + taskIndex * 12), `正在生成片段 ${index + 1} Image Prompt`);
                results[taskIndex] = await generateStoryboardPrompt(index, { silentLoading: true });
            }
        }
        await Promise.all(Array.from({ length: concurrency }, () => runNextPrompt()));
        const okCount = results.filter(Boolean).length;
        showToast(`Image Prompt 逐段生成完成 ${okCount}/${queue.length}`, okCount === queue.length ? 'success' : 'warning');
    } catch (e) {
        showToast('Image Prompt 逐段生成失败: ' + e.message, 'error');
    } finally {
        stopInlineFakeProgress('all-storyboard-prompts');
        resetBtn();
    }
}

async function submitStoryboardPromptJob(fixedInstruction, progressKey) {
    const sourceScript = document.getElementById('scriptInput')?.value?.trim()
        || document.getElementById('storyboardScriptInput')?.value?.trim()
        || currentProjectInfo?.script_text
        || '';
    const assetScope = getScopedAssetPayload(sourceScript);
    const res = await fetch(`/api/projects/${currentProject}/storyboard-prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ratio: getStoryboardRatio(),
            fixed_instruction: [
                fixedInstruction,
                buildAssetScopeInstruction(assetScope, '全剧候选')
            ].join('\n\n'),
            source_script: sourceScript,
            scenes: assetScope.scenes,
            characters: assetScope.characters,
            async: true
        })
    });
    const submitData = await res.json();
    if (!res.ok) {
        showToast(getFriendlyGenerationError(submitData.error, 'Image Prompt 任务提交失败'), 'error');
        return null;
    }
    return pollStoryboardPromptJob(submitData.job_id, progressKey);
}

async function pollStoryboardPromptJob(jobId, progressKey) {
    if (!jobId) return null;
    const startedAt = Date.now();
    const maxMs = 10 * 60 * 1000;
    let attempts = 0;
    while (Date.now() - startedAt < maxMs) {
        attempts += 1;
        await new Promise(resolve => setTimeout(resolve, attempts <= 2 ? 800 : 2000));
        const res = await fetch(`/api/storyboard-prompt-jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) {
            showToast(getFriendlyGenerationError(data.error, 'Image Prompt 状态查询失败'), 'error');
            return null;
        }
        if (progressKey) {
            const progress = Math.min(90, 15 + attempts * 3);
            updateInlineFakeProgress(progressKey, progress, data.message || '正在生成 Image Prompt');
        }
        if (data.status === 'completed') return data;
        if (data.status === 'failed') {
            showToast(getFriendlyGenerationError(data.error || data.message, 'Image Prompt 生成失败'), 'error');
            return null;
        }
    }
    showToast('Image Prompt 生成轮询超时，请稍后刷新项目查看结果', 'warning');
    return null;
}

async function saveStoryboardPromptEdit(index, framePosition = 'start') {
    const seg = currentSegments[index];
    if (!seg?.id) return;
    const promptEl = document.getElementById(`storyboardPrompt-${index}`);
    const prompt = (promptEl?.value || '').trim();
    const oldPrompt = seg.storyboard_prompt;
    if (!prompt || prompt === (oldPrompt || '').trim()) return;
    seg.storyboard_prompt = prompt;
    seg.end_storyboard_prompt = '';
    seg.end_storyboard_status = '';
    await saveSegmentState(index, {
        storyboard_prompt: prompt,
        storyboard_status: seg.storyboard_status || 'prompt_ready',
        end_storyboard_prompt: '',
        end_storyboard_status: '',
    });
    showToast(`片段 ${index + 1} Image Prompt 已保存`, 'success');
}

function restoreStoryboardPageFromProject() {
    const placeholder = document.getElementById('storyboardOnlyPlaceholderCard');
    const panel = document.getElementById('storyboardOnlyPanel');
    const countEl = document.getElementById('storyboardOnlyCount');
    if (!placeholder || !panel || !countEl) return;

    const storyboardSegments = currentSegments.filter(seg => {
        normalizeSegmentState(seg);
        return seg.storyboard_prompt || seg.storyboard_image_path || seg.storyboard_status;
    });
    if (!storyboardSegments.length) {
        placeholder.classList.remove('hidden');
        panel.classList.add('hidden');
        countEl.textContent = '0个分镜';
        renderStoryboardOnlyList([]);
        return;
    }
    placeholder.classList.add('hidden');
    panel.classList.remove('hidden');
    countEl.textContent = `${storyboardSegments.length}个分镜`;
    renderStoryboardOnlyList(currentSegments);
}

async function generateStoryboardImage(index, options = {}) {
    const seg = currentSegments[index];
    if (!seg?.id) {
        showToast('请先生成 Image Prompt 后再生成分镜图', 'warning');
        return false;
    }
    const framePosition = 'start';
    const isEnd = false;
    const frameLabel = '分镜图';
    const promptEl = document.getElementById(`storyboardPrompt-${index}`);
    const prompt = (promptEl?.value || seg.storyboard_prompt || '').trim();
    if (!prompt) {
        showToast('请先生成或填写 Image Prompt', 'warning');
        return false;
    }
    seg.storyboard_prompt = prompt;
    seg.storyboard_status = 'generating';
    seg.end_storyboard_prompt = '';
    seg.end_storyboard_status = '';
    seg.continuity_notes = `${frameLabel}生成中，可继续操作其他片段。`;
    seg._storyboardReferenceImages = options.useReferenceImages ? getStoryboardReferenceSelection(seg) : [];
    const fileInputBeforeRender = document.getElementById(`storyboardFile-${index}`);
    const storyboardReferenceFiles = fileInputBeforeRender?.files?.length ? Array.from(fileInputBeforeRender.files) : [];
    await saveSegmentState(index, { storyboard_prompt: prompt, storyboard_status: 'generating', end_storyboard_prompt: '', end_storyboard_status: '' });
    renderSegments(currentSegments);
    renderStoryboardOnlyList(currentSegments);
    if (!options.silentLoading) {
        const progressAnchor = document.querySelector(`#storyboardPrompt-${index}`)?.closest('.storyboard-block, .storyboard-image-preview-panel');
        startInlineFakeProgress(`storyboard-image-${framePosition}-${index}`, progressAnchor, `正在生成片段 ${index + 1} ${frameLabel}`, 180);
    }
    showToast(`片段 ${index + 1} ${frameLabel}生成任务已提交，可继续操作`, 'info');
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('ratio', getStoryboardRatio());
        formData.append('frame_position', 'start');
        seg._storyboardReferenceImages.forEach(path => formData.append('reference_images', path));
        if (storyboardReferenceFiles.length) {
            storyboardReferenceFiles.forEach(file => formData.append('reference_files', file));
        }
        const res = await fetch(`/api/segments/${seg.id}/storyboard-image`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            const friendlyError = getFriendlyGenerationError(data.error, '分镜图生成失败');
            if (isEnd) seg.end_storyboard_status = 'failed';
            else seg.storyboard_status = 'failed';
            seg.continuity_notes = friendlyError;
            showToast(friendlyError, 'error');
            renderSegments(currentSegments);
            renderStoryboardOnlyList(currentSegments);
            return false;
        }
        mergeStoryboardFrameSegment(index, data.segment || {}, framePosition, seg);
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast(`片段 ${index + 1} ${frameLabel}已生成，并会自动接入视频参考图`, 'success');
        return true;
    } catch (e) {
        if (isEnd) seg.end_storyboard_status = 'failed';
        else seg.storyboard_status = 'failed';
        seg.continuity_notes = '分镜图请求失败: ' + e.message;
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast('分镜图请求失败: ' + e.message, 'error');
        return false;
    } finally {
        if (!options.silentLoading) stopInlineFakeProgress(`storyboard-image-${framePosition}-${index}`);
    }
}

async function regenerateStoryboardImage(index, options = {}) {
    const seg = currentSegments[index];
    if (!seg?.id) {
        showToast('请先生成 Image Prompt 后再生成分镜图', 'warning');
        return false;
    }
    const promptEl = document.getElementById(`storyboardPrompt-${index}`);
    const hasPrompt = !!(promptEl?.value || seg.storyboard_prompt || '').trim();
    if (options.regeneratePrompt || !hasPrompt) {
        const ok = await generateStoryboardPrompt(index, { silentLoading: options.silentLoading });
        if (!ok) return false;
    }
    return generateStoryboardImage(index, options);
}

async function editStoryboardImage(index) {
    const seg = currentSegments[index];
    if (!seg?.id) {
        showToast('请先生成 Image Prompt 后再编辑分镜图', 'warning');
        return;
    }
    if (!seg.storyboard_image_path) {
        showToast('请先生成分镜图后再编辑', 'warning');
        return;
    }
    const editPromptEl = document.getElementById(`storyboardEditPrompt-${index}`);
    const editPrompt = (editPromptEl?.value || seg._storyboardEditPrompt || '').trim();
    if (!editPrompt) {
        showToast('请填写分镜图编辑提示词', 'warning');
        return;
    }

    seg._storyboardEditPrompt = editPrompt;
    seg.storyboard_status = 'generating';
    seg.continuity_notes = '正在按编辑提示重新生成分镜图，完成后会覆盖当前分镜图。';
    renderSegments(currentSegments);
    renderStoryboardOnlyList(currentSegments);
    const progressAnchor = document.querySelector(`#storyboardEditPrompt-${index}`)
        || document.querySelector(`#storyboardPrompt-${index}`)?.closest('.storyboard-block, .storyboard-image-preview-panel');
    startInlineFakeProgress(`storyboard-edit-${index}`, progressAnchor, `正在编辑片段 ${index + 1} 分镜图`, 180);
    showToast(`片段 ${index + 1} 分镜图编辑任务已提交，可继续操作`, 'info');

    try {
        const formData = new FormData();
        formData.append('edit_prompt', editPrompt);
        formData.append('ratio', getStoryboardRatio());
        const res = await fetch(`/api/segments/${seg.id}/storyboard-image/edit`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            const friendlyError = getFriendlyGenerationError(data.error, '分镜图编辑失败');
            seg.storyboard_status = 'failed';
            seg.continuity_notes = friendlyError;
            showToast(friendlyError, 'error');
            renderSegments(currentSegments);
            renderStoryboardOnlyList(currentSegments);
            return;
        }
        mergeStoryboardFrameSegment(index, data.segment || {}, 'start', seg);
        currentSegments[index]._storyboardEditPrompt = '';
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast(`片段 ${index + 1} 分镜图已编辑并覆盖`, 'success');
    } catch (e) {
        seg.storyboard_status = 'failed';
        const friendlyError = getFriendlyGenerationError(e.message, '分镜图编辑请求失败');
        seg.continuity_notes = friendlyError;
        renderSegments(currentSegments);
        renderStoryboardOnlyList(currentSegments);
        showToast(friendlyError, 'error');
    } finally {
        stopInlineFakeProgress(`storyboard-edit-${index}`);
    }
}

async function generateAllStoryboardImages() {
    if (!currentSegments.length) {
        showToast('当前没有可生成的片段', 'warning');
        return;
    }
    startInlineFakeProgress('all-storyboard-images', document.querySelector('[onclick="generateAllStoryboardImages()"]'), '正在批量生成分镜图片', 240);
    showToast('正在并行提交全部分镜图片任务，可继续操作页面', 'info');
    const tasks = currentSegments.map(async (seg, i) => {
        if (!seg.storyboard_prompt) {
            await generateStoryboardPrompt(i, { silentLoading: true });
        }
        if (!currentSegments[i].storyboard_image_path) {
            return generateStoryboardImage(i, { silentLoading: true });
        }
        return true;
    });
    const results = await Promise.allSettled(tasks);
    stopInlineFakeProgress('all-storyboard-images');
    const okCount = results.filter(r => r.status === 'fulfilled').length;
    showToast(`分镜图片并行处理完成 ${okCount}/${currentSegments.length}`, okCount ? 'success' : 'warning');
}

async function runStoryboardImageAutoQueue(targets, options = {}) {
    const queue = Array.isArray(targets) ? targets.filter(item => item?.seg?.id || currentSegments[item?.index]?.id) : [];
    if (!queue.length) return [];
    const requestedConcurrency = parseInt(options.concurrency || queue.length, 10) || queue.length;
    const concurrency = Math.max(1, Math.min(queue.length, requestedConcurrency));
    const results = new Array(queue.length).fill(false);
    let cursor = 0;

    async function runNext() {
        while (cursor < queue.length) {
            const taskIndex = cursor;
            cursor += 1;
            const { seg, index } = queue[taskIndex];
            const latest = currentSegments[index] || seg;
            if (!latest?.id) {
                results[taskIndex] = false;
                continue;
            }
            if (latest.storyboard_image_path) {
                results[taskIndex] = true;
                continue;
            }
            try {
                if (!latest.storyboard_prompt) {
                    results[taskIndex] = await regenerateStoryboardImage(index, { silentLoading: true });
                } else {
                    results[taskIndex] = await generateStoryboardImage(index, { silentLoading: true });
                }
            } catch (e) {
                console.warn('自动生成故事板图失败:', e);
                results[taskIndex] = false;
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => runNext()));
    return results;
}

async function autoGenerateStoryboardPromptsAfterScript() {
    if (!isStoryboardModeEnabled() || !currentSegments.length) return;
    const targets = currentSegments
        .map((seg, index) => ({ seg, index }))
        .filter(item => item.seg?.id && !item.seg.storyboard_prompt);
    if (!targets.length) return;

    showToast(`正在后台逐段生成 ${targets.length} 个 Image Prompt；不会自动生成分镜图`, 'info');
    startInlineFakeProgress('auto-storyboard-prompts', document.querySelector('.script-prompt-generate-all') || document.getElementById('generateAllStoryboardPromptsBtn'), '正在逐段生成 Image Prompt', 180);
    const results = new Array(targets.length).fill(false);
    let cursor = 0;
    const concurrency = Math.min(2, targets.length);

    async function runNextPrompt() {
        while (cursor < targets.length) {
            const taskIndex = cursor;
            cursor += 1;
            const { index } = targets[taskIndex];
            updateInlineFakeProgress('auto-storyboard-prompts', Math.min(90, 12 + taskIndex * 12), `正在生成片段 ${index + 1} Image Prompt`);
            try {
                results[taskIndex] = await generateStoryboardPrompt(index, { silentLoading: true });
            } catch (e) {
                console.warn('自动生成 Image Prompt 失败:', e);
                results[taskIndex] = false;
            }
        }
    }

    await Promise.all(Array.from({ length: concurrency }, () => runNextPrompt()));
    stopInlineFakeProgress('auto-storyboard-prompts');
    const okCount = results.filter(Boolean).length;
    if (okCount === targets.length) {
        showToast(`Image Prompt 已全部生成 ${okCount}/${targets.length}，请检查后手动生成分镜图或视频`, 'success');
    } else {
        showToast(`Image Prompt 生成完成 ${okCount}/${targets.length}，失败的片段可在卡片内重新生成`, okCount ? 'warning' : 'error');
    }
}

async function confirmStoryboard() {
    // 从编辑器中收集最新内容并保存到数据库，避免重启后丢失编辑结果
    for (let i = 0; i < currentSegments.length; i++) {
        const seg = currentSegments[i];
        const editor = document.getElementById(`segEditor-${i}`);
        if (editor) {
            seg._original = seg._original || seg.prompt;
            seg.prompt = readMentionEditorValue(editor).trim();
        }
        await saveSegmentState(i, { status: seg.status || 'ready' });
    }

    storyboardConfirmed = true;
    renderSegments(currentSegments);
    showToast('台本已确认并保存，可以开始生成视频', 'success');
}

function normalizeVideoDuration(value) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return 5;
    return Math.min(15, Math.max(4, n));
}

function stopSegmentFakeProgress(index) {
    const timer = segmentProgressTimers.get(index);
    if (timer) clearInterval(timer);
    segmentProgressTimers.delete(index);
}

function formatElapsedTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) return `${minutes}分${seconds}秒`;
    return `${seconds}秒`;
}

function startSegmentFakeProgress(index, startPercent = 12) {
    stopSegmentFakeProgress(index);
    const seg = currentSegments[index];
    const segmentKey = getSegmentCacheKey(seg);
    // 计时显示必须从真实开始时间算起，不能为了匹配初始进度而倒推开始时间。
    const startedAt = seg?._progressStartedAt || Date.now();
    if (seg) {
        seg._progressStartedAt = startedAt;
        cacheSegmentProgress(seg);
    }
    const tick = () => {
        const currentIndex = currentSegments.findIndex(item => getSegmentCacheKey(item) === segmentKey);
        const currentSeg = currentIndex >= 0 ? currentSegments[currentIndex] : null;
        if (!currentSeg || currentSeg._genStatus !== 'generating') {
            stopSegmentFakeProgress(index);
            return;
        }
        const elapsed = Date.now() - startedAt;
        const percent = Math.min(99, Math.max(startPercent, Math.floor(startPercent + (elapsed / VIDEO_FAKE_PROGRESS_MS) * (99 - startPercent))));
        updateSegmentProgress(currentIndex, percent, `生成中，已生成 ${formatElapsedTime(elapsed)}...`, 'generating');
    };
    tick();
    segmentProgressTimers.set(index, setInterval(tick, 1000));
}

function updateSegmentProgress(index, percent, text, status) {
    const seg = currentSegments[index];
    if (seg) {
        seg._progressPercent = Math.max(0, Math.min(100, Math.floor(percent)));
        seg._progressText = text || '';
        if (status) seg._genStatus = status;
        cacheSegmentProgress(seg);
    }

    const wrap = document.querySelector(`#segment-${index} .segment-inline-progress`);
    const bar = document.getElementById(`segProgressBar-${index}`);
    const percentEl = document.getElementById(`segProgressPercent-${index}`);
    const textEl = document.getElementById(`segProgressText-${index}`);
    const statusEl = document.querySelector(`#segment-${index} .segment-status`);
    const timelineProgressTextEl = document.getElementById(`segmentTimelineProgressText-${index}`);
    const timelineStatusEl = document.getElementById(`segmentTimelineStatus-${index}`);

    if (wrap) {
        wrap.className = `segment-inline-progress ${status || seg?._genStatus || 'generating'}`;
    }
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, Math.floor(percent)))}%`;
    if (percentEl) percentEl.textContent = `${Math.max(0, Math.min(100, Math.floor(percent)))}%`;
    if (textEl) textEl.textContent = text || '';
    if (timelineProgressTextEl) timelineProgressTextEl.textContent = `${Math.max(0, Math.min(100, Math.floor(percent)))}%`;
    if (timelineStatusEl) {
        const meta = getSegmentStatusMeta(seg || { _genStatus: status || 'generating' });
        timelineStatusEl.className = `segment-status ${meta.statusClass}`;
        timelineStatusEl.textContent = meta.statusLabel;
    }
    if (statusEl && status) {
        const meta = getSegmentStatusMeta(seg || { _genStatus: status });
        statusEl.className = `segment-status ${meta.statusClass}`;
        statusEl.textContent = meta.statusLabel;
    }
    renderWorkbenchDashboard();
    updateProductionTopBanner();
}

const CONTINUATION_PROMPT_PREFIX = '衔接[视频1]生成后续故事';

function applyContinuationPromptPrefix(prompt) {
    const cleaned = (prompt || '').replace(/^(?:衔接\[视频1\]生成后续故事[。\s]*|延续视频1生成后续故事[。\s]*)+/g, '').trimStart();
    return `${CONTINUATION_PROMPT_PREFIX}${cleaned}`;
}

function getSegmentReferenceVideoUrl(seg) {
    if (!seg) return '';
    normalizeSegmentState(seg);
    const url = seg._videoUrl || seg.video_url || '';
    if (url && /^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)) return url;
    return '';
}

function getSegmentReferenceVideoPath(seg) {
    if (!seg) return '';
    normalizeSegmentState(seg);
    const localPath = seg._localVideoPath || seg.local_video_path || '';
    if (localPath && /^uploads\/videos\//i.test(localPath)) return localPath;
    const url = seg.video_url || '';
    if (url && /^uploads\/videos\//i.test(url)) return url;
    return '';
}

async function generateSingleVideoFromPrevious(index) {
    if (index <= 0) {
        showToast('第一个片段没有上条视频可参考', 'warning');
        return false;
    }
    const previousSeg = currentSegments[index - 1];
    const previousVideoUrl = getSegmentReferenceVideoUrl(previousSeg);
    const previousVideoPath = getSegmentReferenceVideoPath(previousSeg);
    if (!previousVideoUrl && !previousVideoPath) {
        showToast(`上条视频没有可供平台下载的远程地址或本地视频文件，请等待片段 ${index} 完成并保存后再试`, 'warning');
        return false;
    }
    if (!previousVideoUrl && previousVideoPath) {
        const ready = await ensurePublicTunnelForVideoEdit(null, {
            preparingText: '正在准备临时公网地址，用于上传上条视频参考...',
            preparingToast: '正在自动准备临时公网地址，用于上传上条视频参考',
            failureText: '临时公网地址未启用，无法上传上条视频参考。',
            failureToast: '临时公网地址未启用，无法上传上条视频参考'
        });
        if (!ready) return false;
    }
    return generateSingleVideo(index, {
        referenceVideoUrl: previousVideoUrl,
        referenceVideoPath: previousVideoPath,
        fallbackReferenceVideoPath: previousVideoPath,
        continuationPrefix: CONTINUATION_PROMPT_PREFIX,
    });
}

function buildMainlineVideoGenerationPrompt(seg, index, imagePrompt, manualVideoPrompt = '') {
    const duration = normalizeVideoDuration(seg?.duration || 5);
    const storyboardLine = seg?.storyboard_image_path
        ? `上传分镜图是生视频接口的首帧锚定图 / image-to-video first-frame lock，不作为画面中物体；视频第一帧必须严格匹配分镜图01起始格或当前片段对应视觉区域的构图、镜头高度、人物站位、主体比例、前中后景、景深和光影节奏；前0.5-1秒先保持锁帧构图，再从该首帧自然运动；参考已生成分镜图 ${seg.storyboard_image_path}。`
        : '当前片段尚未附带分镜图；不要自行重新拆段或重排镜头。';
    const manual = String(manualVideoPrompt || '').trim();
    return [
        `片段 ${index + 1} Video Prompt，目标时长 ${duration} 秒以内。`,
        '只根据下方 Image Prompt 和已附带的分镜图生成视频；不要重新输入、读取或改写原段台本，不要重新拆段。',
        storyboardLine,
        '把 Image Prompt 中每一格的对白格位、口型、表情、动作、视线和镜头关系转译成连续视频表现；画面中不要出现字幕、对白框、分镜格线、箭头、面板编号、说明文字、UI、Logo 或水印。',
        manual ? `用户手动补充的 Video Prompt/视频要求：\n${manual}` : '',
        `Image Prompt：\n${imagePrompt}`
    ].filter(Boolean).join('\n\n');
}

async function generateSingleVideo(index, options = {}) {
    const seg = currentSegments[index];
    if (!seg) return false;
    normalizeSegmentState(seg);

    const editor = document.getElementById(`segEditor-${index}`);
    const editorPrompt = (editor ? readMentionEditorValue(editor) : (seg.prompt || seg.prompt_text || '')).trim();
    const storyboardPromptEl = document.getElementById(`storyboardPrompt-${index}`);
    const imagePrompt = (storyboardPromptEl?.value || seg.storyboard_prompt || '').trim();
    const mainlineVideoFlow = isStoryboardModeEnabled();

    if (mainlineVideoFlow && !imagePrompt) {
        showToast(`片段 ${index + 1} 请先生成 Image Prompt，再生成视频`, 'warning');
        return false;
    }
    if (mainlineVideoFlow && !seg.storyboard_image_path) {
        showToast(`片段 ${index + 1} 请先生成分镜图，再生成视频；关闭分镜驱动可走兼容旧流程`, 'warning');
        return false;
    }
    if (imagePrompt) {
        seg.storyboard_prompt = imagePrompt;
    }

    const savedVideoPrompt = getSegmentVideoPrompt(seg);
    let prompt = mainlineVideoFlow
        ? ((seg._videoPromptDirty && editorPrompt) || savedVideoPrompt || buildMainlineVideoGenerationPrompt(seg, index, imagePrompt, ''))
        : editorPrompt;
    if (options.continuationPrefix) {
        prompt = applyContinuationPromptPrefix(prompt);
    }
    if (!prompt) {
        showToast(`片段 ${index + 1} 提示词不能为空`, 'warning');
        return false;
    }
    if (!mainlineVideoFlow || seg._videoPromptDirty || savedVideoPrompt) {
        seg.prompt = prompt;
        seg.prompt_text = prompt;
        if (editor) writeMentionEditorValue(editor, prompt);
    }

    const selectedMode = document.getElementById(`segMode-${index}`)?.value || seg._mode || 'text_to_video';
    const mode = (mainlineVideoFlow && seg.storyboard_image_path) ? 'omni_reference' : selectedMode;
    const ratio = document.getElementById(`segRatio-${index}`)?.value || seg._ratio || '16:9';
    const duration = normalizeVideoDuration(document.getElementById(`segDuration-${index}`)?.value || seg.duration || 5);
    const fileInput = document.getElementById(`segFile-${index}`);
    seg._mode = mode;
    seg._ratio = ratio;
    seg.duration = duration;

    seg.end_storyboard_prompt = '';
    seg.end_storyboard_status = '';
    await saveSegmentState(index, { status: 'ready' });

    seg._genStatus = 'generating';
    seg._progressPercent = 5;
    seg._progressText = '提交中...';
    if (!document.querySelector(`#segment-${index} .segment-inline-progress`)) {
        renderSegments(currentSegments);
    }
    updateSegmentProgress(index, 5, '提交中...', 'generating');

    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('segment_id', seg.id || '');
        formData.append('mode', mode);
        formData.append('ratio', ratio);
        formData.append('duration', duration);
        formData.append('include_storyboard_frames', isStoryboardModeEnabled() ? '1' : '0');
        if (mainlineVideoFlow && seg.storyboard_image_path) {
            formData.append('storyboard_image_path', seg.storyboard_image_path);
            formData.append('storyboard_reference_image', seg.storyboard_image_path);
            formData.append('reference_images', seg.storyboard_image_path);
            formData.append('reference_image_labels', '首帧锁帧参考图');
        }
        if (options.referenceVideoUrl) formData.append('reference_video_url', options.referenceVideoUrl);
        if (options.referenceVideoPath) formData.append('reference_video_path', options.referenceVideoPath);
        // 新流程：后端从 prompt 中解析 @char:xxx / @scene:xxx 自行构建图片列表
        // 前端不再传 library_images / character_images / scene_image。
        // 同时同步 seg._libraryImages 用于本地 UI 状态展示（基于台本 @ 顺序）。
        seg._libraryImages = getMentionImagesFromPrompt(prompt);
        if (fileInput?.files?.length) {
            Array.from(fileInput.files).forEach(file => formData.append('reference_files', file));
        }

        const res = await fetch('/api/generate-video', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            const canRetryWithLocalUpload = Boolean(
                options.referenceVideoUrl &&
                options.fallbackReferenceVideoPath &&
                !options._usedReferenceVideoFallback &&
                !(data.error || '').includes('API未配置') &&
                !(data.error || '').includes('提示词不能为空')
            );
            if (canRetryWithLocalUpload) {
                updateSegmentProgress(index, 15, '远程视频地址提交失败，改用临时公网上传重试...', 'generating');
                showToast('远程视频地址提交失败，正在改用临时公网上传上条视频后重试', 'warning');
                const ready = await ensurePublicTunnelForVideoEdit(document.getElementById(`segProgressText-${index}`), {
                    preparingText: '正在准备临时公网地址，用于上传上条视频参考...',
                    preparingToast: '正在自动准备临时公网地址，用于上传上条视频参考',
                    failureText: '临时公网地址未启用，无法上传上条视频参考。',
                    failureToast: '临时公网地址未启用，无法上传上条视频参考'
                });
                if (ready) {
                    return generateSingleVideo(index, {
                        ...options,
                        referenceVideoUrl: '',
                        referenceVideoPath: options.fallbackReferenceVideoPath,
                        _usedReferenceVideoFallback: true
                    });
                }
            }
            seg._genStatus = 'failed';
            updateSegmentProgress(index, 100, '提交失败', 'failed');
            showToast(data.error || '视频生成失败', 'error');
            return false;
        }

        if (data.task_id) {
            seg._taskId = data.task_id;
            seg._progressStartedAt = Date.now();
            updateSegmentProgress(index, 12, '已提交，排队中...', 'generating');
            startSegmentFakeProgress(index, 12);
            const pollPromise = pollVideoStatus(data.task_id, index, { silentLoading: true });
            return options.waitForCompletion ? pollPromise : true;
        }

        return true;
    } catch (e) {
        seg._genStatus = 'failed';
        updateSegmentProgress(index, 100, '请求失败', 'failed');
        showToast('请求失败: ' + e.message, 'error');
        return false;
    }
}

async function generateAllVideos() {
    showToast('正在并行提交全部视频片段，可继续操作页面', 'info');
    const tasks = currentSegments.map((_, i) => generateSingleVideo(i, { silentLoading: true }));
    const results = await Promise.allSettled(tasks);
    const okCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    showToast(`已并行提交 ${okCount}/${currentSegments.length} 个片段，生成状态将在片段内更新`, okCount ? 'success' : 'warning');
}

async function generateAllVideosSequentially(button) {
    if (!currentSegments.length) {
        showToast('当前没有可生成的视频片段', 'warning');
        return;
    }

    const resetBtn = button ? setButtonBusy(button, '⏳ 顺序生成中') : null;
    let previousVideoUrl = '';
    let previousVideoPath = '';
    let okCount = 0;
    showToast('开始按顺序生成：后续片段会引用上一个视频', 'info');

    try {
        for (let i = 0; i < currentSegments.length; i++) {
            if (i > 0 && !previousVideoUrl && previousVideoPath) {
                const ready = await ensurePublicTunnelForVideoEdit(null, {
                    preparingText: '正在准备临时公网地址，用于上传上条视频参考...',
                    preparingToast: '正在自动准备临时公网地址，用于上传上条视频参考',
                    failureText: '临时公网地址未启用，无法上传上条视频参考。',
                    failureToast: '临时公网地址未启用，无法上传上条视频参考'
                });
                if (!ready) break;
            }
            const result = await generateSingleVideo(i, {
                silentLoading: true,
                waitForCompletion: true,
                referenceVideoUrl: previousVideoUrl,
                referenceVideoPath: previousVideoPath,
                fallbackReferenceVideoPath: previousVideoPath,
                continuationPrefix: (previousVideoUrl || previousVideoPath) ? CONTINUATION_PROMPT_PREFIX : '',
            });
            if (!result || !(result.video_url || result.local_video_path)) {
                showToast(`片段 ${i + 1} 未成功生成，已停止顺序生成`, 'error');
                break;
            }
            previousVideoUrl = getSegmentReferenceVideoUrl(currentSegments[i]);
            previousVideoPath = getSegmentReferenceVideoPath(currentSegments[i]);
            okCount++;
        }
        showToast(`顺序生成完成：${okCount}/${currentSegments.length} 个片段`, okCount === currentSegments.length ? 'success' : 'warning');
    } finally {
        if (resetBtn) resetBtn();
    }
}

function getCompletedVideoCount() {
    return currentSegments.filter(seg => {
        normalizeSegmentState(seg);
        return seg._genStatus === 'completed' && (seg._localVideoPath || seg.local_video_path);
    }).length;
}

function saveVideoEditorState() {
    try {
        localStorage.setItem(VIDEO_EDITOR_STORAGE_KEY, JSON.stringify({
            sourcePath: videoEditorSourcePath,
            pendingEdit: pendingVideoEditorEdit,
            undoStack: videoEditorUndoStack,
            activeJob: videoEditorActiveJob
        }));
    } catch (e) {
        console.warn('保存视频编辑状态失败:', e);
    }
}

function restoreVideoEditorState() {
    try {
        const raw = localStorage.getItem(VIDEO_EDITOR_STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw) || {};
        videoEditorSourcePath = state.sourcePath || '';
        pendingVideoEditorEdit = state.pendingEdit || null;
        videoEditorUndoStack = Array.isArray(state.undoStack) ? state.undoStack : [];
        videoEditorActiveJob = state.activeJob || null;
        refreshVideoEditorPreview();
        renderVideoEditorPendingEdit();
        renderVideoEditorUndoPanel();
        if (videoEditorActiveJob?.job_id) {
            startVideoEditorFakeProgress('检测到未完成的视频编辑任务，已自动恢复轮询...');
            pollStandaloneVideoEditJob(videoEditorActiveJob.job_id, 0);
        }
    } catch (e) {
        console.warn('恢复视频编辑状态失败:', e);
    }
}

function setVideoEditorSource(videoPath) {
    videoEditorSourcePath = videoPath || '';
    if (!videoEditorSourcePath) videoEditorTargetSegmentIndex = null;
    refreshVideoEditorPreview();
    renderVideoEditorPendingEdit();
    renderVideoEditorUndoPanel();
    saveVideoEditorState();
}

function getSegmentEditableVideoPath(seg) {
    if (!seg) return '';
    const localPath = seg._localVideoPath || seg.local_video_path || '';
    if (localPath) return localPath.replace(/^\/+/, '');
    const url = seg._videoUrl || seg.video_url || '';
    if (/^uploads\/videos\//i.test(url)) return url.replace(/^\/+/, '');
    return '';
}

function loadSegmentVideoToEditor(index = activeSegmentEditIndex) {
    const seg = currentSegments[index];
    const videoPath = getSegmentEditableVideoPath(seg);
    if (!videoPath) {
        showToast(`片段 ${index + 1} 还没有可编辑的本地视频`, 'warning');
        return false;
    }
    videoEditorTargetSegmentIndex = index;
    setVideoEditorSource(videoPath);
    showToast(`已载入片段 ${index + 1} 视频编辑`, 'success');
    return true;
}

function refreshVideoEditorPreview() {
    // 视频编辑标签页激活/进入时被调用：顺便确保 MentionEditor 已挂载
    ensureVideoEditorMentionEditor();
    const info = document.getElementById('videoEditorSourceInfo');
    const preview = document.getElementById('videoEditorPreview');
    if (info) info.textContent = videoEditorSourcePath ? `当前视频：${videoEditorSourcePath}` : '尚未载入视频';
    if (!preview) return;
    if (!videoEditorSourcePath) {
        preview.innerHTML = '<p>上传或导入视频后将在这里预览</p>';
        preview.classList.add('empty-state');
        preview.dataset.videoPath = '';
        setWorkflowResultReady('video-editor', false);
        return;
    }
    if (preview.dataset.videoPath === videoEditorSourcePath) return;
    preview.classList.remove('empty-state');
    preview.dataset.videoPath = videoEditorSourcePath;
    preview.innerHTML = `<video src="/${escAttr(videoEditorSourcePath)}" controls preload="none"></video><div class="local-path">${escHtml(videoEditorSourcePath)}</div>`;
    autoCollapseWorkflowInput('video-editor');
}

function renderVideoEditorPendingEdit() {
    const panel = document.getElementById('videoEditorPendingResult');
    if (!panel) return;
    if (!pendingVideoEditorEdit?.result_video_path) {
        panel.classList.add('hidden');
        panel.innerHTML = '';
        return;
    }
    const newPath = pendingVideoEditorEdit.result_video_path;
    const oldPath = pendingVideoEditorEdit.source_video_path || videoEditorSourcePath || '';
    panel.classList.remove('hidden');
    panel.innerHTML = `
        <div class="video-editor-confirm-title">✅ 新视频已生成，请确认是否替换当前片段</div>
        <div class="video-editor-confirm-grid">
            <div>
                <div class="video-editor-confirm-label">当前视频</div>
                ${oldPath ? `<video src="/${escAttr(oldPath)}" controls preload="none"></video><div class="local-path">${escHtml(oldPath)}</div>` : '<p class="local-path">暂无当前视频</p>'}
            </div>
            <div>
                <div class="video-editor-confirm-label">新生成视频</div>
                <video src="/${escAttr(newPath)}" controls preload="none"></video>
                <div class="local-path">${escHtml(newPath)}</div>
            </div>
        </div>
        <div class="video-editor-confirm-actions">
            <button class="btn btn-sm btn-secondary" onclick="discardVideoEditorPendingEdit()">不替换</button>
            <button class="btn btn-sm btn-primary" onclick="confirmVideoEditorPendingEdit()">确认替换当前片段</button>
        </div>`;
}

function renderVideoEditorUndoPanel() {
    const panel = document.getElementById('videoEditorUndoPanel');
    if (!panel) return;
    if (!videoEditorUndoStack.length) {
        panel.classList.add('hidden');
        panel.innerHTML = '';
        return;
    }
    const lastPath = videoEditorUndoStack[videoEditorUndoStack.length - 1];
    panel.classList.remove('hidden');
    panel.innerHTML = `
        <span>可撤回到上一版：${escHtml(lastPath)}</span>
        <button class="btn btn-sm btn-secondary" onclick="undoVideoEditorReplacement()">撤回修改</button>`;
}

function confirmVideoEditorPendingEdit() {
    if (!pendingVideoEditorEdit?.result_video_path) return;
    const previousPath = videoEditorSourcePath || pendingVideoEditorEdit.source_video_path || '';
    if (previousPath) videoEditorUndoStack.push(previousPath);
    const nextPath = pendingVideoEditorEdit.result_video_path;
    pendingVideoEditorEdit = null;
    videoEditorActiveJob = null;
    setVideoEditorSource(nextPath);
    if (Number.isInteger(videoEditorTargetSegmentIndex) && currentSegments[videoEditorTargetSegmentIndex]) {
        const seg = currentSegments[videoEditorTargetSegmentIndex];
        seg._localVideoPath = nextPath;
        seg.local_video_path = nextPath;
        seg.video_url = nextPath;
        seg.status = 'completed';
        seg._genStatus = 'completed';
        saveSegmentState(videoEditorTargetSegmentIndex, {
            local_video_path: nextPath,
            video_url: nextPath,
            status: 'completed'
        });
        renderSegments(currentSegments);
    }
    const statusEl = document.getElementById('videoEditorStatus');
    if (statusEl) statusEl.textContent = '已确认替换；如需恢复，可点击预览区下方“撤回修改”';
    showToast('已替换为新生成视频，可撤回本次修改', 'success');
}

function discardVideoEditorPendingEdit() {
    pendingVideoEditorEdit = null;
    videoEditorActiveJob = null;
    renderVideoEditorPendingEdit();
    saveVideoEditorState();
    const statusEl = document.getElementById('videoEditorStatus');
    if (statusEl) statusEl.textContent = '已保留当前视频，未替换新生成视频';
    showToast('已取消替换，当前视频保持不变', 'info');
}

function undoVideoEditorReplacement() {
    const previousPath = videoEditorUndoStack.pop();
    if (!previousPath) return;
    pendingVideoEditorEdit = null;
    videoEditorActiveJob = null;
    setVideoEditorSource(previousPath);
    const statusEl = document.getElementById('videoEditorStatus');
    if (statusEl) statusEl.textContent = '已撤回最近一次替换';
    showToast('已撤回最近一次视频替换', 'success');
}

async function uploadVideoEditorSource() {
    const input = document.getElementById('videoEditorUpload');
    const file = input?.files?.[0];
    if (!file) {
        showToast('请先选择要上传的视频', 'warning');
        return;
    }
    const formData = new FormData();
    formData.append('video', file);
    if (currentProject) formData.append('project_id', currentProject);
    try {
        const res = await fetch('/api/video-editor/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '上传视频失败', 'error');
            return;
        }
        videoEditorTargetSegmentIndex = null;
        setVideoEditorSource(data.video_path);
        showToast('视频已载入视频编辑模式', 'success');
    } catch (e) {
        showToast('上传视频失败: ' + e.message, 'error');
    }
}

async function importMergedVideoToEditor() {
    if (!currentProject) {
        showToast('请先选择或生成一个项目', 'warning');
        return;
    }
    showToast('正在生成/导入当前项目拼接成片...', 'info');
    try {
        const res = await fetch(`/api/projects/${currentProject}/merge-videos`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '导入拼接成片失败', 'error');
            return;
        }
        renderMergedVideo(data.video_path);
        videoEditorTargetSegmentIndex = null;
        setVideoEditorSource(data.video_path);
        showToast('当前项目拼接成片已导入视频编辑模式', 'success');
    } catch (e) {
        showToast('导入拼接成片失败: ' + e.message, 'error');
    }
}

function getVideoEditorReferenceItems() {
    const refs = [];
    getSelectedIdsInDisplayOrder('char').forEach(id => {
        const character = characters.find(c => c.id === id);
        if (character?.image_path) refs.push({ path: character.image_path, label: `人物：${character.name || id}` });
    });
    getSelectedIdsInDisplayOrder('scene').forEach(id => {
        const scene = scenes.find(s => s.id === id);
        if (scene?.image_path) refs.push({ path: scene.image_path, label: `场景：${scene.name || id}` });
    });
    const seen = new Set();
    return refs.filter(ref => {
        if (!ref.path || seen.has(ref.path)) return false;
        seen.add(ref.path);
        return true;
    });
}

function getVideoEditorReferenceImages() {
    return getVideoEditorReferenceItems().map(ref => ref.path);
}

function getVideoEditorReferenceRelationText() {
    const relationItems = getVideoEditorReferenceItems().map((ref, index) => `[图${index + 1}] ${ref.label}`);
    const offset = relationItems.length;
    const uploadCount = document.getElementById('videoEditorReferenceFiles')?.files?.length || 0;
    Array.from({ length: uploadCount }, (_, index) => {
        relationItems.push(`[图${offset + index + 1}] 玩家上传参考图${index + 1}`);
    });
    return relationItems.length ? relationItems.join('；') : '当前未选择参考图';
}

function updateVideoEditorReferenceRelation() {
    const relationEl = document.getElementById('videoEditorReferenceRelation');
    if (relationEl) relationEl.textContent = getVideoEditorReferenceRelationText();
}

function onVideoEditorReferenceFilesChange() {
    const input = document.getElementById('videoEditorReferenceFiles');
    const countEl = document.getElementById('videoEditorReferenceFileCount');
    if (countEl) countEl.textContent = `${input?.files?.length || 0}张 · 将追加在人物、场景参考图之后`;
    updateVideoEditorReferenceRelation();
}

function updateVideoEditorFakeProgress(message = '视频编辑生成中...') {
    const statusEl = document.getElementById('videoEditorStatus');
    if (!statusEl || !videoEditorActiveJob) return;
    const startedAt = videoEditorActiveJob.submitted_at || Date.now();
    const elapsed = Date.now() - startedAt;
    const percent = Math.min(99, Math.floor((elapsed / VIDEO_FAKE_PROGRESS_MS) * 99));
    statusEl.innerHTML = `
        <div class="segment-inline-progress generating" style="margin-top:0">
            <div class="segment-progress-info">
                <span>${escHtml(message)}，已生成时间 ${formatElapsedTime(elapsed)}</span>
                <span>${percent}%</span>
            </div>
            <div class="segment-progress-track">
                <div class="segment-progress-bar" style="width:${percent}%"></div>
            </div>
        </div>`;
}

function startVideoEditorFakeProgress(message = '视频编辑生成中...') {
    stopVideoEditorFakeProgress(false);
    updateVideoEditorFakeProgress(message);
    videoEditorProgressTimer = setInterval(() => updateVideoEditorFakeProgress(message), 1000);
}

function stopVideoEditorFakeProgress(clearStatus = false) {
    if (videoEditorProgressTimer) {
        clearInterval(videoEditorProgressTimer);
        videoEditorProgressTimer = null;
    }
    if (clearStatus) {
        const statusEl = document.getElementById('videoEditorStatus');
        if (statusEl) statusEl.textContent = '';
    }
}

async function submitStandaloneVideoEdit() {
    if (!videoEditorSourcePath) {
        showToast('请先上传视频或导入拼接成片', 'warning');
        return false;
    }
    const startSecond = document.getElementById('videoEditorStart')?.value;
    const endSecond = document.getElementById('videoEditorEnd')?.value;
    const promptEl = document.getElementById('videoEditorPrompt');
    // 新流程：视频编辑提示词使用 MentionEditor，从其 getValue() 读出含 @char:xxx 的原始文本；
    // 后端会自行从 prompt 解析 @ 序列、按顺序反查图片、翻译为 [图N] 发给视频模型。
    const prompt = (readMentionEditorValue(promptEl) || '').trim();
    const statusEl = document.getElementById('videoEditorStatus');
    if (!prompt) {
        showToast('请填写视频编辑提示词', 'warning');
        return false;
    }
    if (statusEl) statusEl.textContent = '正在准备视频编辑任务...';
    try {
        const publicTunnelReady = await ensurePublicTunnelForVideoEdit(statusEl);
        if (!publicTunnelReady) return false;
        if (statusEl) statusEl.textContent = '正在提交视频编辑任务...';
        const referenceFileInput = document.getElementById('videoEditorReferenceFiles');
        const formData = new FormData();
        formData.append('source_video_path', videoEditorSourcePath);
        formData.append('start_second', startSecond);
        formData.append('end_second', endSecond);
        formData.append('prompt', prompt);
        formData.append('ratio', '16:9');
        formData.append('project_id', currentProject || '');
        // 不再传 reference_images / reference_image_labels：完全由后端从 prompt 中 @ 解析。
        // 仅保留"额外临时上传图"通道（不占用 [图N] 编号，追加在 @ 提及图之后）。
        if (referenceFileInput?.files?.length) {
            Array.from(referenceFileInput.files).forEach((file) => {
                formData.append('reference_files', file);
            });
        }
        const res = await fetch('/api/video-editor/range-repair', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '提交视频编辑失败', 'error');
            if (statusEl) statusEl.textContent = data.error || '提交失败';
            return false;
        }
        videoEditorActiveJob = {
            job_id: data.job_id,
            task_id: data.task_id || '',
            source_video_path: videoEditorSourcePath,
            submitted_at: Date.now()
        };
        startVideoEditorFakeProgress('视频编辑任务已提交，正在生成中...');
        saveVideoEditorState();
        return pollStandaloneVideoEditJob(data.job_id, 0);
    } catch (e) {
        showToast('提交视频编辑失败: ' + e.message, 'error');
        if (statusEl) statusEl.textContent = '提交失败';
        return false;
    }
}

async function pollStandaloneVideoEditJob(jobId, attempts = 0) {
    const statusEl = document.getElementById('videoEditorStatus');
    if (attempts > 180) {
        stopVideoEditorFakeProgress();
        if (statusEl) statusEl.textContent = '视频编辑轮询超时';
        showToast('视频编辑轮询超时', 'error');
        return false;
    }
    await new Promise(resolve => setTimeout(resolve, attempts <= 1 ? 1000 : 5000));
    try {
        const res = await fetch(`/api/video-range-repair-jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) {
            if (statusEl) statusEl.textContent = data.error || '查询视频编辑任务失败';
            showToast(data.error || '查询视频编辑任务失败', 'error');
            return false;
        }
        updateVideoEditorFakeProgress(data.message || data.status || '视频编辑生成中...');
        if (data.status === 'completed') {
            pendingVideoEditorEdit = {
                source_video_path: data.source_video_path || videoEditorActiveJob?.source_video_path || videoEditorSourcePath,
                result_video_path: data.result_video_path
            };
            videoEditorActiveJob = null;
            stopVideoEditorFakeProgress();
            renderVideoEditorPendingEdit();
            saveVideoEditorState();
            if (statusEl) statusEl.textContent = '视频编辑完成，请在确认窗口预览后决定是否替换当前片段';
            showToast('视频编辑完成，请确认后再替换当前片段', 'success');
            return true;
        }
        if (data.status === 'failed') {
            videoEditorActiveJob = null;
            stopVideoEditorFakeProgress();
            saveVideoEditorState();
            showToast(data.message || '视频编辑失败', 'error');
            return false;
        }
        return pollStandaloneVideoEditJob(jobId, attempts + 1);
    } catch (e) {
        updateVideoEditorFakeProgress(`等待视频编辑任务更新(${attempts + 1})...`);
        return pollStandaloneVideoEditJob(jobId, attempts + 1);
    }
}

function videoSrcWithCache(videoPath) {
    if (!videoPath) return '';
    return `/${videoPath}`;
}

function renderMergedVideo(videoPath) {
    const panel = document.getElementById('mergedVideoPanel');
    if (!panel) return;
    if (!videoPath) {
        panel.classList.add('hidden');
        panel.innerHTML = '';
        return;
    }
    panel.classList.remove('hidden');
    panel.innerHTML = `
        <div class="merged-video-title">🎞️ 拼接成片</div>
        <video src="${escAttr(videoSrcWithCache(videoPath))}" controls preload="none"></video>
        <div class="local-path">已保存到资料库：${escHtml(videoPath)}</div>
    `;
}

async function mergeProjectVideos() {
    if (!currentProject) {
        showToast('请先选择或生成一个项目', 'warning');
        return;
    }
    if (!currentSegments.length) {
        showToast('当前项目没有视频片段', 'warning');
        return;
    }

    const completedCount = getCompletedVideoCount();
    if (!completedCount) {
        showToast('当前项目还没有可拼接的已生成视频', 'warning');
        return;
    }

    showLoading('正在拼接已生成的视频...', 60);
    try {
        const res = await fetch(`/api/projects/${currentProject}/merge-videos`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '拼接失败', 'error');
            return;
        }
        renderMergedVideo(data.video_path);
        const skippedCount = data.skipped_count || 0;
        const skippedText = skippedCount ? `，已跳过 ${skippedCount} 个未生成完成片段` : '';
        showToast(`拼接完成，共合并 ${data.segment_count || completedCount} 个片段${skippedText}`, 'success');
    } catch (e) {
        showToast('拼接请求失败: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

async function pollVideoStatus(taskId, segIndex, options = {}) {
    const initialSeg = currentSegments[segIndex] || {};
    const segmentId = initialSeg.id || options.segmentId || '';
    const segmentKey = getSegmentCacheKey(initialSeg) || segmentId || taskId;
    const pollerKey = `${segmentKey}:${taskId}`;
    if (activeVideoPollers.has(pollerKey)) clearTimeout(activeVideoPollers.get(pollerKey));

    let attempts = 0;
    const maxAttempts = 180;

    const findVisibleSegment = () => {
        const index = currentSegments.findIndex(item => item.id === segmentId || getSegmentCacheKey(item) === segmentKey || item._taskId === taskId || item.task_id === taskId);
        return { index, seg: index >= 0 ? currentSegments[index] : null };
    };

    const writeProgressCache = (patch) => {
        const previous = segmentProgressCache.get(segmentKey) || {};
        segmentProgressCache.set(segmentKey, {
            ...previous,
            ...patch,
            _taskId: taskId
        });
        if (segmentId && segmentId !== segmentKey) {
            segmentProgressCache.set(segmentId, segmentProgressCache.get(segmentKey));
        }
    };

    const applyVisibleProgress = (patch, percent, text, status) => {
        const { index, seg } = findVisibleSegment();
        if (!seg) return { index: -1, seg: null };
        Object.assign(seg, patch);
        if (typeof percent === 'number') updateSegmentProgress(index, percent, text, status);
        else cacheSegmentProgress(seg);
        return { index, seg };
    };

    const scheduleNextPoll = () => new Promise(resolve => {
        const timer = setTimeout(async () => resolve(await poll()), 5000);
        activeVideoPollers.set(pollerKey, timer);
    });

    const poll = async () => {
        attempts++;

        if (attempts > maxAttempts) {
            writeProgressCache({ _genStatus: 'failed', _progressPercent: 100, _progressText: '轮询超时' });
            const { index } = applyVisibleProgress({ _genStatus: 'failed' }, 100, '轮询超时', 'failed');
            if (index >= 0) stopSegmentFakeProgress(index);
            activeVideoPollers.delete(pollerKey);
            return { success: false };
        }

        try {
            const res = await fetch('/api/check-video-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, segment_id: segmentId })
            });
            const data = await res.json();
            const status = data?.status;

            if (status === 'completed' || status === 'success') {
                const patch = {
                    _genStatus: 'completed',
                    _videoUrl: data.video_url || '',
                    _localVideoPath: data.local_video_path || '',
                    _progressPercent: 100,
                    _progressText: '已完成'
                };
                writeProgressCache(patch);
                const { index, seg } = applyVisibleProgress(patch);
                if (seg) {
                    if (data.video_url) seg.video_url = data.video_url;
                    if (data.local_video_path) seg.local_video_path = data.local_video_path;
                    seg.status = 'completed';
                    stopSegmentFakeProgress(index);
                    renderSegments(currentSegments);
                    showToast(`片段 ${index + 1} 视频已生成并保存到本地资料库`, 'success');
                } else {
                    showToast('后台项目中的一个视频片段已生成完成', 'success');
                }
                activeVideoPollers.delete(pollerKey);
                if (data.local_video_error) showToast(data.local_video_error, 'warning');
                return { success: true, video_url: patch._videoUrl, local_video_path: patch._localVideoPath };
            } else if (status === 'failed' || status === 'error') {
                writeProgressCache({ _genStatus: 'failed', _progressPercent: 100, _progressText: '生成失败' });
                const { index } = applyVisibleProgress({ _genStatus: 'failed' }, 100, '生成失败', 'failed');
                if (index >= 0) stopSegmentFakeProgress(index);
                activeVideoPollers.delete(pollerKey);
                return { success: false };
            }

            writeProgressCache({ _genStatus: 'generating' });
            const { index, seg } = applyVisibleProgress({ _genStatus: 'generating' });
            if (seg && index >= 0) updateSegmentProgress(index, seg._progressPercent || 12, seg._progressText || `等待状态更新(${attempts})...`, 'generating');
            return scheduleNextPoll();
        } catch (e) {
            const { index, seg } = applyVisibleProgress({ _genStatus: 'generating' });
            if (seg && index >= 0) updateSegmentProgress(index, seg._progressPercent || 12, `等待状态更新(${attempts})...`, 'generating');
            return scheduleNextPoll();
        }
    };

    return poll();
}

function resumeVisibleGeneratingSegments() {
    currentSegments.forEach((seg, index) => {
        normalizeSegmentState(seg);
        if (seg._genStatus !== 'generating' || !seg._taskId) return;
        const startPercent = Number.isFinite(seg._progressPercent) ? Math.max(12, Math.min(99, seg._progressPercent)) : 12;
        if (!seg._progressStartedAt) {
            seg._progressStartedAt = Date.now();
        }
        startSegmentFakeProgress(index, startPercent);
        pollVideoStatus(seg._taskId, index, { silentLoading: true });
    });
}

// ==================== 项目工作台 ====================
function segmentHasVideo(seg) {
    return Boolean(seg?.local_video_path || seg?._localVideoPath || seg?._videoUrl || seg?.video_url || seg?.video_path);
}

function getSegmentDisplayStatus(seg) {
    const status = statusToGenStatus(seg?.status || seg?._genStatus);
    if (segmentHasVideo(seg)) return 'completed';
    return status || 'idle';
}

function getWorkbenchStats(project, segments = []) {
    const safeSegments = Array.isArray(segments) ? segments : [];
    const totalSegments = safeSegments.length;
    const completedVideos = safeSegments.filter(segmentHasVideo).length;
    const missingStoryboards = safeSegments.filter(seg => !seg?.storyboard_image_path).length;
    const generatingSegments = safeSegments.filter(seg => getSegmentDisplayStatus(seg) === 'generating').length;
    const failedSegments = safeSegments.filter(seg => getSegmentDisplayStatus(seg) === 'failed').length;
    const hasProject = Boolean(project?.id || currentProject);
    const hasScript = Boolean(project?.script_text || document.getElementById('scriptInput')?.value?.trim());

    let nextStep = {
        key: 'project',
        title: '新建或打开项目',
        description: '先建立项目容器，后续剧本、分镜和视频都会归档在这里。',
        tab: 'projects',
        actionLabel: '打开项目管理'
    };

    if (hasProject && !totalSegments) {
        nextStep = {
            key: 'script',
            title: hasScript ? '生成 Image Prompt' : '输入台本',
            description: '进入制片流水线，补全台本和素材后自动生成带台词格位的 Image Prompt。',
            tab: 'script',
            actionLabel: '进入制片流水线'
        };
    } else if (totalSegments && completedVideos < totalSegments) {
        nextStep = {
            key: 'video',
            title: '生成视频片段',
            description: `已完成 ${completedVideos}/${totalSegments} 个视频片段。分镜图作为主线参考，Extra 功能仍可随时使用。`,
            tab: 'script',
            actionLabel: '生成视频'
        };
    } else if (totalSegments) {
        nextStep = {
            key: 'merge',
            title: '拼接与交付',
            description: '视频片段已齐，可以拼接成片，或继续视频编辑、导入引擎。',
            tab: 'script',
            actionLabel: '拼接成片'
        };
    }

    return {
        hasProject,
        totalSegments,
        completedVideos,
        missingStoryboards,
        generatingSegments,
        failedSegments,
        nextStep
    };
}

function getWorkbenchFlowSteps(stats) {
    const hasSegments = stats.totalSegments > 0;
    const storyboardsDone = hasSegments && stats.missingStoryboards === 0;
    const videosDone = hasSegments && stats.completedVideos >= stats.totalSegments;
    return [
        { key: 'project', label: '项目', desc: '容器与资料', tab: 'projects', state: stats.hasProject ? 'done' : 'current', lane: 'main' },
        { key: 'script', label: 'Image', desc: '台本到分镜提示', tab: 'script', state: hasSegments ? 'done' : (stats.hasProject ? 'current' : 'pending'), lane: 'main' },
        { key: 'video', label: '视频', desc: '分镜驱动生成', tab: 'script', state: videosDone ? 'done' : (hasSegments ? 'current' : 'pending'), lane: 'main' },
        { key: 'merge', label: '成片', desc: '拼接编辑', tab: 'video-editor', state: videosDone ? 'current' : 'pending', lane: 'main' },
        { key: 'storyboard', label: '分镜', desc: '主线视觉蓝图', tab: 'storyboard', state: storyboardsDone ? 'done' : 'optional', optional: true, lane: 'optional' },
        { key: 'reference3d', label: '3D参考', desc: '空间校验', tab: 'reference-3d', state: 'optional', optional: true, lane: 'optional' },
        { key: 'delivery', label: '引擎', desc: 'JSON导出', tab: 'ue5-json', state: 'optional', optional: true, lane: 'optional' }
    ];
}

function openWorkbenchNextStep(tab) {
    switchToTab(tab || getWorkbenchStats(currentProjectInfo, currentSegments).nextStep.tab);
}

function getWorkbenchSegmentThumb(seg, index) {
    if (seg?.storyboard_image_path) {
        return `<img src="/${escAttr(seg.storyboard_image_path)}" alt="片段${index + 1}分镜">`;
    }
    const videoSrc = seg?._localVideoPath ? videoSrcWithCache(seg._localVideoPath) : (seg?._videoUrl || '');
    if (videoSrc) {
        return `<video src="${escAttr(videoSrc)}" muted preload="metadata"></video>`;
    }
    return `<span>${index + 1}</span>`;
}

function renderWorkbenchDashboard() {
    const kpiEl = document.getElementById('workbenchKpiGrid');
    const nextEl = document.getElementById('workbenchNextAction');
    const flowEl = document.getElementById('workbenchFlowSteps');
    const segmentEl = document.getElementById('workbenchSegmentList');
    const taskEl = document.getElementById('workbenchTaskCenter');
    if (!kpiEl && !nextEl && !flowEl && !segmentEl && !taskEl) return;

    const stats = getWorkbenchStats(currentProjectInfo, currentSegments);

    if (kpiEl) {
        kpiEl.innerHTML = [
            { label: '视频片段', value: stats.totalSegments, hint: '当前项目拆分结果' },
            { label: '已完成视频', value: stats.completedVideos, hint: `${stats.completedVideos}/${Math.max(stats.totalSegments, 1)} 个片段` },
            { label: '可选分镜', value: stats.missingStoryboards, hint: '缺口仅影响参考，不阻塞视频' },
            { label: '进行中任务', value: stats.generatingSegments, hint: stats.failedSegments ? `${stats.failedSegments} 个失败待处理` : '可继续操作其他区域' }
        ].map(item => `
            <div class="workbench-kpi-card">
                <span>${escHtml(item.label)}</span>
                <strong>${escHtml(item.value)}</strong>
                <small>${escHtml(item.hint)}</small>
            </div>
        `).join('');
    }

    if (nextEl) {
        const step = stats.nextStep;
        nextEl.innerHTML = `
            <div>
                <span class="eyebrow">下一步</span>
                <h3>${escHtml(step.title)}</h3>
                <p>${escHtml(step.description)}</p>
            </div>
            <button class="btn btn-primary" onclick="openWorkbenchNextStep('${escAttr(step.tab)}')">${escHtml(step.actionLabel)}</button>
        `;
    }

    if (flowEl) {
        const steps = getWorkbenchFlowSteps(stats);
        const renderStep = step => `
            <button type="button" class="workbench-flow-step ${step.state}" onclick="switchToTab('${escAttr(step.tab)}')">
                <span class="workbench-flow-dot"></span>
                <strong>${escHtml(step.label)}</strong>
                <small>${escHtml(step.desc)}</small>
                ${step.optional ? '<em>可选</em>' : ''}
            </button>
        `;
        flowEl.innerHTML = `
            <div class="workbench-flow-lane main-lane">
                <div class="workbench-flow-lane-title">
                    <strong>主线流程</strong>
                    <span>不经过分镜也能继续生成视频</span>
                </div>
                <div class="workbench-flow-track">${steps.filter(step => step.lane === 'main').map(renderStep).join('')}</div>
            </div>
            <div class="workbench-flow-lane optional-lane">
                <div class="workbench-flow-lane-title">
                    <strong>可选增强</strong>
                    <span>需要更稳定画面或引擎交付时再使用</span>
                </div>
                <div class="workbench-flow-track">${steps.filter(step => step.lane === 'optional').map(renderStep).join('')}</div>
            </div>
        `;
    }

    if (segmentEl) {
        if (!currentSegments.length) {
            segmentEl.innerHTML = `
                <div class="workbench-empty">
                    <strong>还没有视频片段</strong>
                    <span>进入视频生成页，生成台本后这里会显示分镜、状态和下一步操作。</span>
                </div>`;
        } else {
            segmentEl.innerHTML = currentSegments.map((seg, index) => {
                normalizeSegmentState(seg);
                const displayStatus = getSegmentDisplayStatus(seg);
                const progress = Number.isFinite(seg._progressPercent)
                    ? Math.min(Math.max(Math.floor(seg._progressPercent), 0), 100)
                    : (displayStatus === 'completed' ? 100 : (displayStatus === 'generating' ? 8 : 0));
                const statusLabel = {
                    idle: '待生成',
                    generating: '生成中',
                    completed: '已完成',
                    failed: '失败'
                }[displayStatus] || '待生成';
                const prompt = (seg.prompt || seg.prompt_text || seg.scene || '').replace(/\s+/g, ' ').trim();
                return `
                    <button type="button" class="workbench-segment-row ${displayStatus}" onclick="activeSegmentEditIndex=${index}; switchToTab('script'); renderSegments(currentSegments);">
                        <span class="workbench-segment-thumb">${getWorkbenchSegmentThumb(seg, index)}</span>
                        <span class="workbench-segment-copy">
                            <strong>片段 ${index + 1}</strong>
                            <small>${escHtml(prompt || '空片段')}</small>
                        </span>
                        <span class="workbench-segment-meta">
                            <span class="segment-status ${displayStatus === 'failed' ? 'error' : displayStatus}">${statusLabel}</span>
                            ${displayStatus === 'generating' ? `<em>${progress}%</em>` : ''}
                        </span>
                    </button>
                `;
            }).join('');
        }
    }

    if (taskEl) {
        const activeTasks = currentSegments
            .map((seg, index) => ({ seg, index, status: getSegmentDisplayStatus(seg) }))
            .filter(item => item.status === 'generating' || item.status === 'failed');
        if (!activeTasks.length) {
            taskEl.innerHTML = `
                <div class="workbench-empty compact">
                    <strong>暂无进行中任务</strong>
                    <span>提交视频、分镜或编辑任务后，这里会显示进度和失败重试线索。</span>
                </div>`;
        } else {
            taskEl.innerHTML = activeTasks.map(({ seg, index, status }) => {
                const progress = Number.isFinite(seg._progressPercent) ? Math.min(Math.max(Math.floor(seg._progressPercent), 0), 100) : 8;
                const label = status === 'failed' ? '失败' : '生成中';
                return `
                    <div class="workbench-task-card ${status}">
                        <div>
                            <strong>片段 ${index + 1} · ${label}</strong>
                            <span>${escHtml(seg._progressText || seg.error_message || '任务已提交，可继续检查其他片段')}</span>
                        </div>
                        <div class="workbench-task-progress"><i style="width:${status === 'failed' ? 100 : progress}%"></i></div>
                    </div>
                `;
            }).join('');
        }
    }
}

// ==================== 项目管理 ====================
async function initProjectBootstrap() {
    await loadProjects();
    try {
        const res = await fetch('/api/projects/current');
        const project = await res.json();
        if (!res.ok || !project?.id) {
            showToast(project.error || '默认项目加载失败', 'error');
            updateCurrentProjectBar();
            return;
        }
        if (!projectsCache.some(p => p.id === project.id)) {
            projectsCache.unshift(project);
            renderProjects(projectsCache);
        }
        await viewProject(project.id, { silent: true, keepTab: true });
    } catch (e) {
        console.error('加载默认项目失败:', e);
        updateCurrentProjectBar();
    }
}

async function loadProjects() {
    try {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        projectsCache = Array.isArray(projects) ? projects : [];
        if (currentProject) {
            currentProjectInfo = projectsCache.find(p => p.id === currentProject) || currentProjectInfo;
        }
        renderProjects(projectsCache);
        updateCurrentProjectBar();
        renderWorkbenchDashboard();
    } catch (e) {
        console.error('加载项目失败:', e);
    }
}

function updateCurrentProjectBar() {
    const nameEl = document.getElementById('currentProjectName');
    const metaEl = document.getElementById('currentProjectMeta');
    const openBtn = document.getElementById('btnOpenCurrentProject');
    if (!nameEl || !metaEl) return;

    if (!currentProject || !currentProjectInfo) {
        nameEl.textContent = '未选择项目';
        metaEl.textContent = '启动后会自动创建或加载最新项目';
        if (openBtn) openBtn.disabled = true;
        renderWorkbenchDashboard();
        return;
    }

    nameEl.textContent = currentProjectInfo.name || '未命名项目';
    const status = currentProjectInfo.status || 'draft';
    const updated = currentProjectInfo.updated_at || currentProjectInfo.created_at || '';
    metaEl.textContent = `状态：${status}${updated ? ' · 更新时间：' + updated : ''}`;
    if (openBtn) openBtn.disabled = false;
    renderWorkbenchDashboard();
}

function showTopProjectModal() {
    showProjectModal();
}

function openCurrentProjectFromBar() {
    if (!currentProject) {
        showToast('当前没有可打开的项目', 'warning');
        return;
    }
    viewProject(currentProject);
}

function renderProjects(projects) {
    const list = document.getElementById('projectList');
    if (!projects.length) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div><p>暂无项目，点击上方“新建项目”开始，或在视频生成页生成项目</p></div>`;
        return;
    }
    list.innerHTML = projects.map(p => `
        <div class="project-item ${currentProject === p.id ? 'active' : ''}" onclick="viewProject('${escAttr(p.id)}')">
            <div class="project-info">
                <h4>${escHtml(p.name)}</h4>
                <p>${escHtml(p.script_text?.substring(0, 80) || '')}...</p>
            </div>
            <div class="project-meta">
                <span class="badge">${escHtml(p.status)}</span>
                <span style="color:var(--text-muted);font-size:12px">${escHtml(p.created_at || '')}</span>
                <div class="project-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-secondary" onclick="copyProject('${escAttr(p.id)}')">复制</button>
                    <button class="btn btn-sm btn-secondary" onclick="renameProject('${escAttr(p.id)}')">重命名</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${escAttr(p.id)}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showProjectModal() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectScript').value = '';
    document.getElementById('projectModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('projectName')?.focus(), 0);
}

async function createProject() {
    const name = document.getElementById('projectName').value.trim();
    const scriptText = document.getElementById('projectScript').value.trim();
    if (!name) {
        showToast('请输入项目名称', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, script_text: scriptText })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '创建项目失败', 'error');
            return;
        }
        closeModal('projectModal');
        showToast('项目已创建', 'success');
        await loadProjects();
        openDraftProject(data);
    } catch (e) {
        showToast('创建项目失败: ' + e.message, 'error');
    }
}

function openDraftProject(project) {
    saveActiveUe5JsonStateBeforeProjectChange();
    currentProject = project?.id || null;
    currentProjectInfo = project || null;
    currentSegments = [];
    activeSegmentEditIndex = 0;
    storyboardConfirmed = false;
    activateUe5JsonStateForCurrentProject({ reset: true, createIfMissing: true });
    switchToTab('script');
    document.getElementById('scriptInput').value = project?.script_text || '';
    refreshPromptMentionBadges();
    const breakdownInput = document.getElementById('breakdownInput');
    if (breakdownInput && !breakdownInput.value.trim()) breakdownInput.value = project?.script_text || '';
    document.getElementById('resultPlaceholderCard')?.classList.remove('hidden');
    document.getElementById('storyboardPanel')?.classList.add('hidden');
    document.getElementById('segmentCount').textContent = '0个Image段落';
    document.getElementById('resultContent').textContent = '';
    renderMergedVideo('');
    setWorkflowResultEmpty('script');
    updateCurrentProjectBar();
    renderWorkbenchDashboard();
}

async function viewProject(projectId, options = {}) {
    try {
        saveActiveUe5JsonStateBeforeProjectChange();
        const project = projectsCache.find(p => p.id === projectId);
        const res = await fetch(`/api/projects/${projectId}/segments`);
        const segments = await res.json();
        if (!res.ok || !Array.isArray(segments)) {
            showToast(segments.error || '加载项目失败', 'error');
            return;
        }
        currentProject = projectId;
        currentProjectInfo = project || { id: projectId, name: projectId, status: '' };
        currentSegments = segments.map(s => ({
            ...s,
            prompt: s.prompt_text || s.prompt || '',
            duration: Number(s.duration || 5),
            storyboard_count: Number(s.storyboard_count || 0)
        }));
        activeSegmentEditIndex = 0;
        storyboardConfirmed = currentSegments.length > 0;
        activateUe5JsonStateForCurrentProject({ createIfMissing: true });

        if (!options.keepTab) switchToTab('script');
        document.getElementById('scriptInput').value = project?.script_text || '';
        refreshPromptMentionBadges();
        const breakdownInput = document.getElementById('breakdownInput');
        if (breakdownInput && !breakdownInput.value.trim()) breakdownInput.value = project?.script_text || '';

        if (!currentSegments.length) {
            document.getElementById('resultPlaceholderCard')?.classList.remove('hidden');
            document.getElementById('storyboardPanel')?.classList.add('hidden');
            renderMergedVideo('');
            setWorkflowResultReady('script', false);
            setWorkflowInputCollapsed('script', false);
            updateCurrentProjectBar();
            renderWorkbenchDashboard();
            if (!options.silent) showToast('已打开空项目，请输入或完善剧本后开始AI处理', 'info');
            return;
        }

        document.getElementById('resultPlaceholderCard')?.classList.add('hidden');
        document.getElementById('storyboardPanel')?.classList.remove('hidden');
        document.getElementById('segmentCount').textContent = `${currentSegments.length}个Image段落`;
        const toggle = document.getElementById('storyboardModeToggle');
        if (toggle) toggle.checked = localStorage.getItem(STORYBOARD_PROMPTS_STORAGE_KEY) !== '0';
        syncStoryboardPromptToggle();
        document.getElementById('resultContent').textContent = currentSegments.map(s => s.prompt || s.prompt_text || '').join('\n\n===VIDEO_SPLIT===\n\n');

        renderMergedVideo('');
        renderSegments(currentSegments);
        restoreStoryboardPageFromProject();
        updateCurrentProjectBar();
        renderWorkbenchDashboard();
        resumeVisibleGeneratingSegments();
        if (!options.silent) showToast(`已打开项目：${currentProjectInfo.name || projectId}`, 'success');
    } catch (e) {
        showToast('加载项目失败: ' + e.message, 'error');
    }
}

async function renameProject(projectId) {
    const project = projectsCache.find(p => p.id === projectId);
    const oldName = project?.name || '';
    const newName = prompt('请输入新的项目名称', oldName)?.trim();
    if (newName === undefined || newName === oldName) return;
    if (!newName) {
        showToast('项目名称不能为空', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '重命名失败', 'error');
            return;
        }
        showToast('项目已重命名', 'success');
        await loadProjects();
        if (currentProject === projectId) {
            currentProjectInfo = data;
            updateCurrentProjectBar();
            saveUe5JsonPersistentState(projectId);
        }
    } catch (e) {
        showToast('重命名失败: ' + e.message, 'error');
    }
}

async function copyProject(projectId) {
    const project = projectsCache.find(p => p.id === projectId);
    const oldName = project?.name || projectId;
    const copyName = prompt('请输入副本项目名称', `${oldName} 副本`)?.trim();
    if (copyName === undefined) return;
    if (!copyName) {
        showToast('项目名称不能为空', 'warning');
        return;
    }

    try {
        if (currentProject === projectId) saveActiveUe5JsonStateBeforeProjectChange();
        const res = await fetch(`/api/projects/${projectId}/copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: copyName })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '复制项目失败', 'error');
            return;
        }
        showToast('项目副本已创建', 'success');
        copyUe5JsonPersistentState(projectId, data.id);
        await loadProjects();
        await viewProject(data.id);
    } catch (e) {
        showToast('复制项目失败: ' + e.message, 'error');
    }
}

async function deleteProject(projectId) {
    const project = projectsCache.find(p => p.id === projectId);
    const projectName = project?.name || projectId;
    if (!confirm(`确定删除项目“${projectName}”？\n该项目下的视频片段记录也会一起删除。`)) return;

    try {
        const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '删除失败', 'error');
            return;
        }
        if (currentProject === projectId) {
            currentProject = null;
            currentProjectInfo = null;
            currentSegments = [];
            activeSegmentEditIndex = 0;
            document.getElementById('storyboardPanel')?.classList.add('hidden');
            document.getElementById('resultPlaceholderCard')?.classList.remove('hidden');
            activateUe5JsonStateForCurrentProject({ reset: true, createIfMissing: true });
        }
        removeUe5JsonPersistentStateForProject(projectId);
        showToast('项目已删除', 'success');
        await loadProjects();
        if (!currentProject && projectsCache.length) {
            await initProjectBootstrap();
        }
    } catch (e) {
        showToast('删除失败: ' + e.message, 'error');
    }
}

// ==================== 设置 ====================
function initUIBackgroundSettings() {
    const saved = loadUIBackgroundConfig();
    const config = saved.disabled ? saved : { image: saved.image || DEFAULT_UI_BACKGROUND_IMAGE };
    applyUIBackground(config);
    syncUIBackgroundControls(config);
}

function loadUIBackgroundConfig() {
    try {
        return JSON.parse(localStorage.getItem(UI_BACKGROUND_STORAGE_KEY) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function saveUIBackgroundConfig(config) {
    localStorage.setItem(UI_BACKGROUND_STORAGE_KEY, JSON.stringify(config || {}));
}

function applyUIBackground(config) {
    const image = config?.image || '';
    document.body.style.setProperty('--ui-background-image', image ? `url("${image}")` : 'none');
    document.body.classList.toggle('has-ui-background', !!image);
}

function syncUIBackgroundControls(config = loadUIBackgroundConfig()) {
    const preview = document.getElementById('settingUiBackgroundPreview');
    const removeBtn = document.getElementById('btnRemoveUiBackground');
    if (preview) {
        const image = config.disabled ? '' : (config.image || DEFAULT_UI_BACKGROUND_IMAGE);
        if (image) {
            preview.src = image;
            preview.classList.remove('hidden');
        } else {
            preview.removeAttribute('src');
            preview.classList.add('hidden');
        }
    }
    if (removeBtn) removeBtn.disabled = !!config.disabled;
}

function setUIBackgroundImage(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (!(file.type || '').startsWith('image/')) {
        showToast('请选择图片文件', 'warning');
        input.value = '';
        return;
    }
    if (file.size > 8 * 1024 * 1024) {
        showToast('背景图片建议小于 8MB，避免浏览器本地存储失败', 'warning');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        normalizeUIBackgroundImage(reader.result || '')
            .then(image => {
                const config = { image };
                try {
                    saveUIBackgroundConfig(config);
                    applyUIBackground(config);
                    syncUIBackgroundControls(config);
                    showToast('背景图片已应用，并已自动轻微压暗以保护 UI 可视度', 'success');
                } catch (e) {
                    showToast('背景图片保存失败，请尝试更小的图片', 'error');
                }
            })
            .catch(() => showToast('背景图片处理失败', 'error'))
            .finally(() => { input.value = ''; });
    };
    reader.onerror = () => {
        showToast('背景图片读取失败', 'error');
        input.value = '';
    };
    reader.readAsDataURL(file);
}

function normalizeUIBackgroundImage(dataUrl) {
    return new Promise((resolve, reject) => {
        if (!dataUrl) {
            reject(new Error('empty image'));
            return;
        }
        const img = new Image();
        img.onload = () => {
            const maxSide = 2400;
            const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
            const width = Math.max(1, Math.round((img.naturalWidth || img.width) * ratio));
            const height = Math.max(1, Math.round((img.naturalHeight || img.height) * ratio));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0f1117';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

function removeUIBackgroundImage() {
    const config = { disabled: true };
    saveUIBackgroundConfig(config);
    applyUIBackground(config);
    syncUIBackgroundControls(config);
    showToast('背景图片已移除', 'success');
}

function syncJimengProviderFields() {
    const provider = document.getElementById('settingJimengProvider')?.value || 'platform';
    const platformFields = document.getElementById('settingJimengPlatformFields');
    const volcengineFields = document.getElementById('settingJimengVolcengineFields');
    if (platformFields) platformFields.classList.toggle('hidden', provider !== 'platform');
    if (volcengineFields) volcengineFields.classList.toggle('hidden', provider !== 'volcengine');
}

async function handleJimengProviderChange() {
    const provider = document.getElementById('settingJimengProvider')?.value || 'platform';
    syncJimengProviderFields();
    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jimeng_provider: provider })
        });
        if (!res.ok) throw new Error('保存失败');
        showToast('生成接口模式已保存', 'success');
    } catch (e) {
        showToast('生成接口模式保存失败: ' + e.message, 'error');
    }
}

function updatePublicTunnelStatus(data = {}) {
    const statusEl = document.getElementById('publicTunnelStatus');
    const inputEl = document.getElementById('settingVideoPublicBaseUrl');
    const startBtn = document.getElementById('btnStartPublicTunnel');
    const stopBtn = document.getElementById('btnStopPublicTunnel');

    const status = data.status || 'stopped';
    const url = data.url || data.configured_url || '';
    const statusText = {
        running: '已启动',
        starting: '启动中...',
        stopped: '未启动',
        failed: '启动失败',
    }[status] || status;
    if (statusEl) statusEl.textContent = url ? `${statusText}：${url}` : (data.message || statusText);
    if (inputEl && data.url && data.active) inputEl.value = data.url;
    if (startBtn) startBtn.disabled = status === 'starting' || status === 'running';
    if (stopBtn) stopBtn.disabled = status !== 'starting' && status !== 'running';
}

function updateCloudflaredInstallStatus(data = {}) {
    const statusEl = document.getElementById('cloudflaredInstallStatus');
    const installBtn = document.getElementById('btnInstallCloudflared');
    if (!statusEl) return;
    const status = data.status || 'idle';
    const text = data.message || ({
        idle: data.installed ? 'cloudflared 已安装' : '未安装 cloudflared',
        installing: '正在安装 cloudflared...',
        completed: 'cloudflared 已安装完成',
        failed: 'cloudflared 安装失败',
    }[status] || status);
    statusEl.textContent = text;
    if (installBtn) installBtn.disabled = Boolean(data.installed) || status === 'installing';
}

async function refreshPublicTunnelStatus() {
    try {
        const res = await fetch('/api/public-tunnel/status');
        const data = await res.json();
        if (res.ok) updatePublicTunnelStatus(data);
        return data;
    } catch (e) {
        console.warn('公网隧道状态查询失败:', e);
        return null;
    }
}

async function refreshCloudflaredInstallStatus() {
    try {
        const res = await fetch('/api/public-tunnel/install/status');
        const data = await res.json();
        if (res.ok) updateCloudflaredInstallStatus(data);
        return data;
    } catch (e) {
        console.warn('cloudflared 安装状态查询失败:', e);
        return null;
    }
}

async function pollCloudflaredInstallUntilDone(attempt = 0) {
    const data = await refreshCloudflaredInstallStatus();
    if (!data || data.installed || data.status === 'completed' || data.status === 'failed' || attempt >= 120) return data;
    await new Promise(resolve => setTimeout(resolve, 2000));
    return pollCloudflaredInstallUntilDone(attempt + 1);
}

async function pollPublicTunnelUntilReady(attempt = 0) {
    const data = await refreshPublicTunnelStatus();
    if (!data || (data.url && data.active) || data.status === 'failed' || data.status === 'stopped' || attempt >= 30) return data;
    await new Promise(resolve => setTimeout(resolve, 1500));
    return pollPublicTunnelUntilReady(attempt + 1);
}

async function installCloudflared(options = {}) {
    const btn = document.getElementById('btnInstallCloudflared');
    const resetBtn = setButtonBusy(btn, '安装中...');
    try {
        const res = await fetch('/api/public-tunnel/install', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '安装 cloudflared 失败', 'error');
            updateCloudflaredInstallStatus(data);
            return false;
        }
        updateCloudflaredInstallStatus(data);
        const finalData = data.installed || data.status === 'completed'
            ? data
            : await pollCloudflaredInstallUntilDone();
        updateCloudflaredInstallStatus(finalData || {});
        if (finalData?.installed || finalData?.status === 'completed') {
            showToast('cloudflared 已安装完成', 'success');
            if (options.startAfterInstall) {
                return await startPublicTunnel();
            }
            return true;
        }
        showToast(finalData?.message || 'cloudflared 安装未完成', 'warning');
        return false;
    } catch (e) {
        showToast('安装 cloudflared 失败: ' + e.message, 'error');
        return false;
    } finally {
        resetBtn();
        refreshCloudflaredInstallStatus();
    }
}

async function startPublicTunnel(options = {}) {
    const btn = document.getElementById('btnStartPublicTunnel');
    const resetBtn = setButtonBusy(btn, '启动中...');
    try {
        const res = await fetch('/api/public-tunnel/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restart: Boolean(options.restart) })
        });
        const data = await res.json();
        if (!res.ok) {
            if ((data.error || '').includes('未检测到 cloudflared')) {
                showToast('未安装 cloudflared，正在尝试自动安装...', 'info');
                return await installCloudflared({ startAfterInstall: true });
            }
            showToast(data.error || '启动临时公网地址失败', 'error');
            updatePublicTunnelStatus(data);
            return false;
        }
        updatePublicTunnelStatus(data);
        if (data.url && data.active) {
            showToast('临时公网地址已启动并写入设置', 'success');
            await loadSettings();
            return true;
        } else {
            showToast(data.message || 'cloudflared 正在启动，请稍后查看状态', 'info');
            const finalData = await pollPublicTunnelUntilReady();
            if (finalData?.url && finalData?.active) {
                showToast('临时公网地址已启动并写入设置', 'success');
                await loadSettings();
                return true;
            }
            return false;
        }
    } catch (e) {
        showToast('启动临时公网地址失败: ' + e.message, 'error');
        return false;
    } finally {
        resetBtn();
        refreshPublicTunnelStatus();
    }
}

async function stopPublicTunnel() {
    const btn = document.getElementById('btnStopPublicTunnel');
    const resetBtn = setButtonBusy(btn, '关闭中...');
    try {
        const res = await fetch('/api/public-tunnel/stop', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '关闭临时公网地址失败', 'error');
            return;
        }
        updatePublicTunnelStatus(data);
        const inputEl = document.getElementById('settingVideoPublicBaseUrl');
        if (inputEl && !data.configured_url) inputEl.value = '';
        showToast('临时公网地址已关闭', 'success');
    } catch (e) {
        showToast('关闭临时公网地址失败: ' + e.message, 'error');
    } finally {
        resetBtn();
        refreshPublicTunnelStatus();
    }
}

async function ensurePublicTunnelForVideoEdit(statusEl, options = {}) {
    const preparingText = options.preparingText || '正在准备临时公网地址，用于提交前后参考视频...';
    const preparingToast = options.preparingToast || '正在自动准备临时公网地址，用于提交前后参考视频';
    const failureText = options.failureText || '临时公网地址未启用，已停止提交。请稍后重试或检查网络。';
    const failureToast = options.failureToast || '临时公网地址未启用，无法提交前后参考视频';
    const exceptionText = options.exceptionText || '临时公网地址准备失败，已停止提交。';
    const exceptionToast = options.exceptionToast || '临时公网地址准备失败，无法提交前后参考视频';
    try {
        const state = await refreshPublicTunnelStatus();
        const configuredUrl = state?.configured_url || '';
        if (configuredUrl && !/\.trycloudflare\.com\/?$/i.test(configuredUrl)) return true;
        if (statusEl) statusEl.textContent = preparingText;
        showToast(preparingToast, 'info');
        const ok = await startPublicTunnel({ restart: Boolean(state?.url || configuredUrl) });
        const readyState = ok ? await refreshPublicTunnelStatus() : null;
        const ready = Boolean(readyState?.active && readyState?.url);
        if (!ready) {
            if (statusEl) statusEl.textContent = failureText;
            showToast(failureToast, 'error');
        }
        return ready;
    } catch (e) {
        if (statusEl) statusEl.textContent = exceptionText;
        showToast(exceptionToast, 'error');
        return false;
    }
}

async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        document.getElementById('settingOpenaiBase').value = data.openai_base_url || '';
        document.getElementById('settingOpenaiModel').value = data.openai_model || '';
        const reasoningEffortEl = document.getElementById('settingOpenaiReasoningEffort');
        if (reasoningEffortEl) reasoningEffortEl.value = data.openai_reasoning_effort || 'medium';
        const scriptBreakdownPromptEl = document.getElementById('settingScriptBreakdownPrompt');
        if (scriptBreakdownPromptEl) scriptBreakdownPromptEl.value = data.script_breakdown_prompt || '';
        const settingStoryboardPromptEl = document.getElementById('settingStoryboardSystemPrompt');
        if (settingStoryboardPromptEl) settingStoryboardPromptEl.value = data.storyboard_system_prompt || '';
        const storyboardKeyInput = document.getElementById('settingStoryboardOpenaiKey');
        const storyboardBaseEl = document.getElementById('settingStoryboardOpenaiBase');
        const storyboardImageModelEl = document.getElementById('settingStoryboardGptImageModel');
        if (storyboardBaseEl) storyboardBaseEl.value = data.storyboard_openai_base_url || '';
        if (storyboardImageModelEl) storyboardImageModelEl.value = data.storyboard_gpt_image_model || 'gpt-image-2';
        const modeStoryboardPromptEl = document.getElementById('modeStoryboardSystemPrompt');
        if (modeStoryboardPromptEl) modeStoryboardPromptEl.value = data.storyboard_system_prompt || '';
        const modeStoryboardStatusEl = document.getElementById('storyboardModePromptStatus');
        if (modeStoryboardStatusEl) modeStoryboardStatusEl.textContent = data.storyboard_system_prompt ? '已加载' : '使用默认';
        const jimengProviderEl = document.getElementById('settingJimengProvider');
        if (jimengProviderEl) jimengProviderEl.value = data.jimeng_provider || 'platform';
        syncJimengProviderFields();
        const jimengBaseEl = document.getElementById('settingJimengBase');
        if (jimengBaseEl) jimengBaseEl.value = data.jimeng_base_url || 'https://ark.cn-beijing.volces.com/api/v3';
        const jimengModelEl = document.getElementById('settingJimengModel');
        if (jimengModelEl) jimengModelEl.value = data.jimeng_model || 'volcengine/doubao-seedance-2-0-260128';
        const arkBaseEl = document.getElementById('settingArkBase');
        if (arkBaseEl) arkBaseEl.value = data.ark_base_url || '';
        const arkModelEl = document.getElementById('settingArkSeedanceModel');
        if (arkModelEl) arkModelEl.value = data.ark_seedance_model || 'doubao-seedance-2-0-260128';
        const videoPublicBaseEl = document.getElementById('settingVideoPublicBaseUrl');
        if (videoPublicBaseEl) videoPublicBaseEl.value = data.video_public_base_url || '';

        // 回显脱敏的API Key
        const openaiKeyInput = document.getElementById('settingOpenaiKey');
        const jimengKeyInput = document.getElementById('settingJimengKey');
        const arkKeyInput = document.getElementById('settingArkKey');

        if (data.openai_api_key) {
            openaiKeyInput.placeholder = data.openai_api_key + ' (已配置，留空则不修改)';
        } else {
            openaiKeyInput.placeholder = '未配置，请输入API Key';
        }

        if (storyboardKeyInput) {
            if (data.storyboard_openai_api_key) {
                storyboardKeyInput.placeholder = data.storyboard_openai_api_key + ' (已配置，留空则不修改)';
            } else {
                storyboardKeyInput.placeholder = '未配置，请输入分镜生成 API Key';
            }
        }

        if (data.jimeng_api_key) {
            jimengKeyInput.placeholder = data.jimeng_api_key + ' (已配置，留空则不修改)';
        } else {
            jimengKeyInput.placeholder = '未配置，请输入平台兼容 API Key';
        }

        if (arkKeyInput) {
            if (data.ark_api_key) {
                arkKeyInput.placeholder = data.ark_api_key + ' (已配置，留空则不修改)';
            } else {
                arkKeyInput.placeholder = '未配置，请输入火山引擎方舟直达 API Key；留空则可复用上方平台 Key';
            }
        }

        // 更新状态指示
        updateSettingStatus('openai', data.openai_api_key_set);
        updateSettingStatus('storyboard', data.storyboard_openai_api_key_set);
        updateSettingStatus('jimeng', data.jimeng_api_key_set);
        checkFFmpegStatus();
        refreshPublicTunnelStatus();
        refreshCloudflaredInstallStatus();
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

function updateSettingStatus(type, isSet) {
    const id = type === 'openai' ? 'openaiStatus' : (type === 'storyboard' ? 'storyboardStatus' : 'jimengStatus');
    let el = document.getElementById(id);
    if (!el) {
        const header = type === 'openai'
            ? document.querySelector('#tab-settings .card:first-child .card-header')
            : (type === 'storyboard'
                ? document.querySelector('#tab-settings .card:nth-child(2) .card-header')
                : document.querySelector('#tab-settings .card:nth-child(3) .card-header'));
        if (header) {
            el = document.createElement('span');
            el.id = id;
            el.className = 'badge';
            header.appendChild(el);
        }
    }
    if (el) {
        el.textContent = isSet ? '✅ 已配置' : '❌ 未配置';
        el.style.background = isSet ? 'rgba(0,184,148,0.2)' : 'rgba(225,112,85,0.2)';
        el.style.color = isSet ? 'var(--success)' : 'var(--danger)';
    }
}

async function saveStoryboardModePrompt() {
    const prompt = document.getElementById('modeStoryboardSystemPrompt')?.value?.trim() || '';
    if (!prompt) {
        showToast('请输入分镜模式提示词人设', 'warning');
        return;
    }
    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyboard_system_prompt: prompt })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showToast(data.error || '保存分镜模式提示词失败', 'error');
            return;
        }
        const statusEl = document.getElementById('storyboardModePromptStatus');
        if (statusEl) statusEl.textContent = '已保存';
        showToast('分镜模式提示词已保存', 'success');
        await loadSettings();
    } catch (e) {
        showToast('保存分镜模式提示词失败: ' + e.message, 'error');
    }
}

function resetStoryboardModePrompt() {
    loadSettings();
    showToast('已恢复当前已保存的分镜模式提示词', 'info');
}

async function saveSettings() {
    const settings = {
        openai_api_key: document.getElementById('settingOpenaiKey').value.trim(),
        openai_base_url: document.getElementById('settingOpenaiBase').value.trim(),
        openai_model: document.getElementById('settingOpenaiModel').value.trim(),
        openai_reasoning_effort: document.getElementById('settingOpenaiReasoningEffort')?.value || 'medium',
        script_breakdown_prompt: document.getElementById('settingScriptBreakdownPrompt')?.value?.trim() || '',
        storyboard_system_prompt: document.getElementById('settingStoryboardSystemPrompt')?.value?.trim() || '',
        storyboard_openai_api_key: document.getElementById('settingStoryboardOpenaiKey')?.value?.trim() || '',
        storyboard_openai_base_url: document.getElementById('settingStoryboardOpenaiBase')?.value?.trim() || '',
        storyboard_gpt_image_model: document.getElementById('settingStoryboardGptImageModel')?.value?.trim() || '',
        jimeng_provider: document.getElementById('settingJimengProvider')?.value || 'platform',
        jimeng_api_key: document.getElementById('settingJimengKey').value.trim(),
        jimeng_base_url: document.getElementById('settingJimengBase')?.value?.trim() || '',
        jimeng_model: (document.getElementById('settingJimengModel') || {}).value || '',
        ark_api_key: document.getElementById('settingArkKey')?.value?.trim() || '',
        ark_base_url: document.getElementById('settingArkBase')?.value?.trim() || '',
        ark_seedance_model: document.getElementById('settingArkSeedanceModel')?.value?.trim() || '',
        video_public_base_url: document.getElementById('settingVideoPublicBaseUrl')?.value?.trim() || '',
    };

    // 过滤空值
    Object.keys(settings).forEach(k => { if (!settings[k]) delete settings[k]; });

    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (res.ok) {
            showToast('设置已保存', 'success');
            // 重新加载设置以更新状态
            loadSettings();
            // 清空密码输入框
            document.getElementById('settingOpenaiKey').value = '';
            const storyboardKeyEl = document.getElementById('settingStoryboardOpenaiKey');
            if (storyboardKeyEl) storyboardKeyEl.value = '';
            document.getElementById('settingJimengKey').value = '';
            const arkKeyEl = document.getElementById('settingArkKey');
            if (arkKeyEl) arkKeyEl.value = '';
        } else {
            showToast('保存失败', 'error');
        }
    } catch (e) {
        showToast('保存失败: ' + e.message, 'error');
    }
}

function exportProjectData() {
    window.location.href = '/api/data-export';
    showToast('已开始导出全部数据，请等待浏览器下载备份包', 'info');
}

async function importProjectData(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (!confirm('导入会覆盖当前数据库、设置和 uploads 数据。系统会先自动备份当前数据，确定继续导入吗？')) {
        input.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
        showLoading('正在导入数据备份...', 30);
        const res = await fetch('/api/data-import', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || '导入数据失败', 'error');
            return;
        }
        showToast(data.message || '数据已导入，请刷新页面查看最新内容', 'success');
        await Promise.all([loadScenes(), loadCharacters(), loadSettings(), loadProjects()]);
        await initProjectBootstrap();
        loadAssets();
    } catch (e) {
        showToast('导入数据失败: ' + e.message, 'error');
    } finally {
        hideLoading();
        input.value = '';
    }
}

async function checkFFmpegStatus() {
    const statusEl = document.getElementById('ffmpegStatus');
    const pathEl = document.getElementById('ffmpegPath');
    if (statusEl) statusEl.textContent = '检测中...';
    if (pathEl) pathEl.textContent = '当前路径：检测中...';

    try {
        const res = await fetch('/api/ffmpeg/status');
        const data = await res.json();
        if (data.installed) {
            if (statusEl) {
                statusEl.textContent = `✅ 可用${data.source ? ' · ' + data.source : ''}`;
                statusEl.style.background = 'rgba(0,184,148,0.2)';
                statusEl.style.color = 'var(--success)';
            }
            if (pathEl) pathEl.textContent = `当前路径：${data.path || '已安装'}`;
        } else {
            if (statusEl) {
                statusEl.textContent = '❌ 未安装';
                statusEl.style.background = 'rgba(225,112,85,0.2)';
                statusEl.style.color = 'var(--danger)';
            }
            if (pathEl) pathEl.textContent = '当前路径：未检测到 FFmpeg';
        }
    } catch (e) {
        if (statusEl) statusEl.textContent = '检测失败';
        if (pathEl) pathEl.textContent = `检测失败：${e.message}`;
    }
}

async function installFFmpegDependency() {
    const statusEl = document.getElementById('ffmpegStatus');
    const pathEl = document.getElementById('ffmpegPath');
    if (statusEl) statusEl.textContent = '安装中...';
    if (pathEl) pathEl.textContent = '正在通过 pip 安装 imageio-ffmpeg，请稍候...';

    try {
        const res = await fetch('/api/ffmpeg/install', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'FFmpeg 依赖安装失败', 'error');
            if (pathEl) pathEl.textContent = data.error || '安装失败';
            await checkFFmpegStatus();
            return;
        }
        showToast('FFmpeg 依赖安装完成', 'success');
        if (pathEl) pathEl.textContent = `当前路径：${data.path || '已安装'}`;
        await checkFFmpegStatus();
    } catch (e) {
        showToast('FFmpeg 安装请求失败: ' + e.message, 'error');
        if (pathEl) pathEl.textContent = `安装请求失败：${e.message}`;
        await checkFFmpegStatus();
    }
}

async function testOpenAI() {
    const resultDiv = document.getElementById('testResult');
    const resultContent = document.getElementById('testResultContent');
    resultDiv.classList.remove('hidden');
    resultContent.textContent = 'Testing connection...';

    try {
        const res = await fetch('/api/test-openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (!res.ok) {
            resultContent.textContent = `❌ Failed: ${data.error}`;
            resultContent.style.color = 'var(--danger)';
            showToast('AI connection test failed', 'error');
        } else {
            resultContent.textContent = `✅ Connection successful!\n\nModel: ${data.model}\nTokens: ${data.tokens}\nReply: ${data.reply}`;
            resultContent.style.color = 'var(--success)';
            showToast('AI connection test passed', 'success');
        }
    } catch (e) {
        resultContent.textContent = `❌ Request error: ${e.message}`;
        resultContent.style.color = 'var(--danger)';
        showToast('Test request failed', 'error');
    }
}

async function copyControlDataToClipboard(index) {
    const seg = currentSegments[index];
    normalizeSegmentState(seg);
    const text = typeof seg.control_data === 'string' ? seg.control_data : JSON.stringify(seg.control_data || {}, null, 2);
    if (!text || text === '{}') { showToast('当前片段没有3D摄影控制数据', 'warning'); return; }
    try {
        await navigator.clipboard.writeText(text);
        showToast('3D摄影控制数据已复制', 'success');
    } catch (e) {
        showToast('复制失败: ' + e.message, 'error');
    }
}

async function importSegmentControlDataToReference3D(index) {
    const seg = currentSegments[index];
    normalizeSegmentState(seg);
    if (!seg?.control_data) { showToast('当前片段没有3D摄影控制数据', 'warning'); return; }
    await importControlDataToReference3D(seg.control_data);
}

async function importReference3DControlDataFromTextarea() {
    const input = document.getElementById('reference3DControlDataInput');
    const raw = input?.value?.trim() || '';
    if (!raw) { showToast('请先粘贴3D摄影控制JSON', 'warning'); return; }
    let dataText = raw;
    const blockMatch = raw.match(/===CONTROL_DATA_START===\s*([\s\S]*?)\s*===CONTROL_DATA_END===/);
    if (blockMatch) dataText = blockMatch[1].trim();
    try {
        await importControlDataToReference3D(JSON.parse(dataText));
    } catch (e) {
        showToast('控制数据不是合法JSON: ' + e.message, 'error');
    }
}

// ==================== 3D截图参考模式 ====================
async function initReference3DMode() {
    if (reference3D.initialized) {
        resizeReference3DRenderer();
        syncReference3DCameraInputs();
        return;
    }
    if (reference3D.loading) {
        while (reference3D.loading) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        resizeReference3DRenderer();
        syncReference3DCameraInputs();
        return;
    }

    const canvas = document.getElementById('reference3DCanvas');
    const hint = document.getElementById('reference3DHint');
    if (!canvas) return;

    reference3D.loading = true;
    if (hint) hint.textContent = '正在加载 3D 引擎...';

    try {
        const [threeModule, orbitModule, transformModule, gltfModule] = await Promise.all([
            import('three'),
            import('three/addons/controls/OrbitControls.js'),
            import('three/addons/controls/TransformControls.js'),
            import('three/addons/loaders/GLTFLoader.js')
        ]);

        const THREE = threeModule;
        reference3D.THREE = THREE;
        reference3D.OrbitControls = orbitModule.OrbitControls;
        reference3D.TransformControls = transformModule.TransformControls;
        reference3D.GLTFLoader = gltfModule.GLTFLoader;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111827);

        const camera = new THREE.PerspectiveCamera(REFERENCE3D_DEFAULT_FOV, 16 / 9, 0.1, 1000);
        camera.position.set(4, 3, 6);
        camera.lookAt(0, 1, 0);
        scene.add(camera);

        const ambient = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 2.5);
        directional.position.set(4, 6, 3);
        scene.add(directional);

        const ground = createReference3DGroundPlane();
        scene.add(ground);
        reference3D.groundPlane = ground;

        const grid = new THREE.GridHelper(20, 20, 0x6c5ce7, 0x2e3144);
        grid.name = '地面网格';
        grid.visible = reference3D.gridVisible;
        scene.add(grid);
        reference3D.gridHelper = grid;

        const orbit = new reference3D.OrbitControls(camera, renderer.domElement);
        orbit.enableDamping = true;
        orbit.enabled = false;
        orbit.enableRotate = false;
        orbit.enablePan = false;
        orbit.enableZoom = false;
        orbit.target.set(0, 1, 0);

        const transform = new reference3D.TransformControls(camera, renderer.domElement);
        transform.setMode('translate');
        transform.addEventListener('dragging-changed', event => {
            orbit.enabled = false;
        });
        transform.addEventListener('objectChange', () => {
            syncReference3DTransformInputs();
            scheduleReference3DSceneSave(reference3D.selected?.userData?.kind === 'image-plane');
        });
        scene.add(typeof transform.getHelper === 'function' ? transform.getHelper() : transform);

        reference3D.renderer = renderer;
        reference3D.scene = scene;
        reference3D.camera = camera;
        reference3D.orbit = orbit;
        reference3D.transform = transform;
        reference3D.raycaster = new THREE.Raycaster();
        reference3D.pointer = new THREE.Vector2();
        reference3D.initialized = true;

        setupReference3DUEControls(renderer.domElement);
        renderer.domElement.addEventListener('pointerdown', onReference3DPointerDown);
        reference3D.resizeObserver = new ResizeObserver(resizeReference3DRenderer);
        reference3D.resizeObserver.observe(renderer.domElement.parentElement);
        resizeReference3DRenderer();
        animateReference3D();
        await restoreReference3DScene();
        syncReference3DCameraInputs();
        renderReference3DObjectList();
        if (hint) hint.textContent = '固定场景自由摄影机：布景盒、网格和物体保持在世界坐标；右键拖动转向，右键按住时用 W/A/S/D/Q/E 移动相机，滚轮沿视线前进/后退。';
    } catch (e) {
        console.error('3D 引擎加载失败:', e);
        if (hint) hint.textContent = '3D 引擎加载失败，请检查网络或浏览器支持。';
        showToast('3D 引擎加载失败: ' + e.message, 'error');
    } finally {
        reference3D.loading = false;
    }
}

function animateReference3D(time = 0) {
    if (!reference3D.renderer) return;
    reference3D.animationId = requestAnimationFrame(animateReference3D);
    updateReference3DUECamera(time);
    reference3D.renderer.render(reference3D.scene, reference3D.camera);
}

function resizeReference3DRenderer() {
    const renderer = reference3D.renderer;
    const camera = reference3D.camera;
    if (!renderer || !camera) return;
    const wrap = renderer.domElement.parentElement;
    const rect = wrap?.getBoundingClientRect?.();
    const width = Math.max(320, Math.round(rect?.width || wrap?.clientWidth || 960));
    const height = Math.max(320, Math.round(rect?.height || wrap?.clientHeight || 560));
    renderer.setSize(width, height, true);
    camera.aspect = width / height;
    camera.fov = clampReference3DFov(camera.fov);
    camera.updateProjectionMatrix();
    updateReference3DBackgroundPlaneSize();
}

function setupReference3DUEControls(canvas) {
    const controls = reference3D.ueControls;
    reference3D.camera.rotation.order = 'YXZ';
    controls.yaw = reference3D.camera.rotation.y;
    controls.pitch = reference3D.camera.rotation.x;

    canvas.tabIndex = 0;
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    canvas.addEventListener('pointerdown', event => {
        if (event.button !== 2 || reference3D.transform?.dragging) return;
        event.preventDefault();
        controls.enabled = true;
        controls.pointerId = event.pointerId;
        controls.lastPointerX = event.clientX;
        controls.lastPointerY = event.clientY;
        canvas.setPointerCapture?.(event.pointerId);
        canvas.focus();
    });
    canvas.addEventListener('pointermove', event => {
        if (!controls.enabled || controls.pointerId !== event.pointerId) return;
        event.preventDefault();
        const dx = Number.isFinite(event.movementX) && event.movementX !== 0 ? event.movementX : event.clientX - (controls.lastPointerX ?? event.clientX);
        const dy = Number.isFinite(event.movementY) && event.movementY !== 0 ? event.movementY : event.clientY - (controls.lastPointerY ?? event.clientY);
        controls.lastPointerX = event.clientX;
        controls.lastPointerY = event.clientY;
        const sensitivity = 0.0025;
        controls.yaw -= dx * sensitivity;
        controls.pitch -= dy * sensitivity;
        const maxPitch = Math.PI / 2 - 0.02;
        controls.pitch = Math.max(-maxPitch, Math.min(maxPitch, controls.pitch));
        reference3D.camera.rotation.set(controls.pitch, controls.yaw, 0);
        syncReference3DCameraInputs();
        scheduleReference3DSceneSave();
    });
    const stopLook = event => {
        if (controls.pointerId !== null && event.pointerId !== controls.pointerId) return;
        controls.enabled = false;
        controls.pointerId = null;
        controls.lastPointerX = null;
        controls.lastPointerY = null;
    };
    canvas.addEventListener('pointerup', stopLook);
    canvas.addEventListener('pointercancel', stopLook);
    canvas.addEventListener('wheel', event => {
        event.preventDefault();
        const camera = reference3D.camera;
        const THREE = reference3D.THREE;
        if (!camera || !THREE) return;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const distance = Math.min(8, Math.max(-8, -event.deltaY * 0.01));
        camera.position.add(direction.multiplyScalar(distance));
        syncReference3DCameraInputs();
        scheduleReference3DSceneSave();
        const hint = document.getElementById('reference3DHint');
        if (hint) hint.textContent = '已移动摄影机；网格和场景物体保持固定。右键拖动转向，右键+WASD/QE继续移动，Shift加速。';
    }, { passive: false });

    window.addEventListener('keydown', event => {
        if (!controls.enabled) return;
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(key)) {
            controls.keys.add(key);
            event.preventDefault();
        }
    });
    window.addEventListener('keyup', event => {
        controls.keys.delete(event.key.toLowerCase());
    });
}

function updateReference3DUECamera(time) {
    const controls = reference3D.ueControls;
    const camera = reference3D.camera;
    if (!camera) return;
    const last = controls.lastTime || time;
    const delta = Math.min(0.05, Math.max(0, (time - last) / 1000));
    controls.lastTime = time;
    reference3D.mixers.forEach(mixer => mixer.update(delta));
    if (!controls.enabled || !controls.keys.size || delta <= 0) return;

    const THREE = reference3D.THREE;
    const direction = new THREE.Vector3();
    const move = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();
    const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    if (controls.keys.has('w')) move.add(direction);
    if (controls.keys.has('s')) move.sub(direction);
    if (controls.keys.has('d')) move.add(right);
    if (controls.keys.has('a')) move.sub(right);
    if (controls.keys.has('e')) move.y += 1;
    if (controls.keys.has('q')) move.y -= 1;
    if (move.lengthSq() === 0) return;
    move.normalize().multiplyScalar(controls.speed * (controls.keys.has('shift') ? 2.5 : 1) * delta);
    camera.position.add(move);
    syncReference3DCameraInputs();
    scheduleReference3DSceneSave();
}

function onReference3DPointerDown(event) {
    if (event.button !== 0 || reference3D.transform?.dragging || reference3D.ueControls.enabled) return;
    const rect = reference3D.renderer.domElement.getBoundingClientRect();
    reference3D.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    reference3D.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    reference3D.raycaster.setFromCamera(reference3D.pointer, reference3D.camera);
    const hits = reference3D.raycaster.intersectObjects(reference3D.selectable, true);
    if (!hits.length) {
        selectReference3DObject(null);
        return;
    }
    let object = hits[0].object;
    while (object && !object.userData.reference3DSelectable) object = object.parent;
    selectReference3DObject(object || null);
}

function makeReference3DObjectName(prefix, fileName) {
    const base = (fileName || '').replace(/\.[^.]+$/, '').trim();
    return `${prefix}${reference3D.objectSeq++}${base ? '：' + base : ''}`;
}

function triggerReference3DFileInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        showToast('找不到导入控件', 'error');
        return;
    }
    input.click();
}

function isReference3DImageFile(file) {
    if (!file) return false;
    if ((file.type || '').startsWith('image/')) return true;
    return /\.(png|jpe?g|webp|gif|bmp|avif|ico|svg|jfif|pjpeg|pjp)$/i.test(file.name || '');
}

function getReference3DFiles(fileList, predicate) {
    const files = Array.from(fileList || []);
    if (!files.length) return [];
    const matched = files.filter(predicate);
    return matched.length ? matched : files;
}

function readReference3DFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || '');
        reader.onerror = () => reject(reader.error || new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

async function addReference3DImagePlanes(fileList) {
    await initReference3DMode();
    if (!reference3D.initialized || !reference3D.THREE) {
        showToast('3D 引擎未加载完成，无法导入图片', 'error');
        return;
    }
    const files = getReference3DFiles(fileList, isReference3DImageFile);
    if (!files.length) {
        showToast('请选择图片文件', 'warning');
        return;
    }

    const THREE = reference3D.THREE;
    const loader = new THREE.TextureLoader();
    for (const file of files) {
        let dataUrl = '';
        try {
            dataUrl = await readReference3DFileAsDataUrl(file);
        } catch (e) {
            showToast(`图片读取失败：${file.name}`, 'error');
            continue;
        }
        const url = dataUrl || URL.createObjectURL(file);
        loader.load(url, texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const image = texture.image || {};
            const aspect = image.width && image.height ? image.width / image.height : 1;
            const height = 2.4;
            const width = Math.max(0.3, height * aspect);
            const geometry = new THREE.PlaneGeometry(width, height);
            geometry.translate(0, height / 2, 0);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = makeReference3DObjectName('图片平面 ', file.name);
            mesh.position.set((reference3D.selectable.length % 4) - 1.5, 0, 0);
            mesh.userData.reference3DSelectable = true;
            mesh.userData.objectUrl = dataUrl ? '' : url;
            mesh.userData.sourceDataUrl = dataUrl;
            mesh.userData.kind = 'image-plane';
            reference3D.scene.add(mesh);
            reference3D.selectable.push(mesh);
            selectReference3DObject(mesh);
            renderReference3DObjectList();
            scheduleReference3DSceneSave(true);
            showToast(`已导入图片平面：${file.name}`, 'success');
        }, undefined, error => {
            console.error(error);
            URL.revokeObjectURL(url);
            showToast(`图片导入失败：${file.name}`, 'error');
        });
    }
}

async function addReference3DPersonBox() {
    await initReference3DMode();
    if (!reference3D.initialized || !reference3D.THREE || !reference3D.GLTFLoader) {
        showToast('3D 引擎未加载完成，无法添加 XBot 灰模小人', 'error');
        return;
    }

    addReference3DXBotCharacter({
        name: makeReference3DObjectName('角色 ', 'XBot Idle'),
        position: {
            x: (reference3D.selectable.length % 5) - 2,
            y: 0,
            z: Math.floor(reference3D.selectable.length / 5) * 1.2
        }
    }).then(character => {
        if (!character) return;
        selectReference3DObject(character);
        renderReference3DObjectList();
        showToast('已添加 XBot 灰模小人 Idle，可用移动/旋转/缩放调整站位', 'success');
    });
}

function addReference3DXBotCharacter(options = {}) {
    return new Promise(resolve => {
        const loader = new reference3D.GLTFLoader();
        loader.load('/static/models/reference-character-xbot.glb', gltf => {
            const character = gltf.scene;
            character.name = options.name || 'XBot 灰模小人';
            character.userData.reference3DSelectable = true;
            character.userData.kind = 'character';
            groundReference3DModelWithoutScaling(character);
            character.traverse(child => {
                if (!child.isMesh) return;
                child.castShadow = true;
                child.receiveShadow = true;
            });

            const pos = options.position || {};
            const rot = options.rotation || {};
            character.position.set(numberOr(pos.x, 0), numberOr(pos.y, 0), numberOr(pos.z, 0));
            character.rotation.set(degToRad(numberOr(rot.x, 0)), degToRad(numberOr(rot.y, 0)), degToRad(numberOr(rot.z, 0)));
            reference3D.scene.add(character);
            reference3D.selectable.push(character);

            const idleClip = (gltf.animations || []).find(clip => /idle/i.test(clip.name)) || gltf.animations?.[0];
            if (idleClip) {
                const mixer = new reference3D.THREE.AnimationMixer(character);
                mixer.clipAction(idleClip).play();
                mixer.userData = { root: character };
                reference3D.mixers.push(mixer);
            }
            scheduleReference3DSceneSave();
            resolve(character);
        }, undefined, error => {
            console.error(error);
            showToast('XBot 灰模小人模型加载失败', 'error');
            resolve(null);
        });
    });
}

async function addReference3DModels(fileList) {
    await initReference3DMode();
    const files = Array.from(fileList || []).filter(file => /\.(glb|gltf)$/i.test(file.name));
    if (!files.length) {
        showToast('请选择 .glb 或 .gltf 模型文件', 'warning');
        return;
    }

    const loader = new reference3D.GLTFLoader();
    for (const file of files) {
        const url = URL.createObjectURL(file);
        loader.load(url, gltf => {
            const model = gltf.scene;
            model.name = makeReference3DObjectName('模型 ', file.name);
            model.userData.reference3DSelectable = true;
            model.userData.objectUrl = url;
            model.userData.kind = 'model';
            normalizeReference3DModelSize(model);
            model.position.x = (reference3D.selectable.length % 4) - 1.5;
            reference3D.scene.add(model);
            reference3D.selectable.push(model);
            selectReference3DObject(model);
            renderReference3DObjectList();
            scheduleReference3DSceneSave();
            showToast(`已导入模型：${file.name}`, 'success');
        }, undefined, error => {
            console.error(error);
            URL.revokeObjectURL(url);
            showToast(`模型导入失败：${file.name}`, 'error');
        });
    }
}

function groundReference3DModelWithoutScaling(model) {
    const THREE = reference3D.THREE;
    const box = new THREE.Box3().setFromObject(model);
    if (Number.isFinite(box.min.y)) model.position.y -= box.min.y;
}

function normalizeReference3DModelSize(model) {
    const THREE = reference3D.THREE;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxSide = Math.max(size.x, size.y, size.z);
    if (maxSide > 0) model.scale.multiplyScalar(2 / maxSide);
    groundReference3DModelWithoutScaling(model);
}

function loadReference3DSingleBackgroundFromDataUrl(dataUrl, silent = false) {
    const THREE = reference3D.THREE;
    if (!THREE || !dataUrl) return;
    new THREE.TextureLoader().load(dataUrl, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        disposeReference3DBackground();
        reference3D.backgroundUrls = [];
        reference3D.backgroundSourceDataUrl = dataUrl;
        setReference3DBackgroundPlane(texture);
        if (!silent) showToast('已设置单张背景图（保持原比例）', 'success');
        scheduleReference3DSceneSave(true);
    }, undefined, error => {
        console.error(error);
        if (!silent) showToast('背景图加载失败', 'error');
    });
}

async function setReference3DSingleBackground(file) {
    if (!file) return;
    await initReference3DMode();
    if (!isReference3DImageFile(file)) {
        showToast('请选择图片文件', 'warning');
        return;
    }
    try {
        loadReference3DSingleBackgroundFromDataUrl(await readReference3DFileAsDataUrl(file));
    } catch (e) {
        showToast('背景图读取失败', 'error');
    }
}

function getReference3DBackdropModeLabel() {
    return reference3D.backdropMode === 'curved' ? '圆弧布景' : '方形布景盒';
}

function setReference3DBackdropMode(mode) {
    if (!['box', 'curved'].includes(mode)) return;
    reference3D.backdropMode = mode;
    document.querySelectorAll('[data-reference3d-backdrop-mode]').forEach(button => {
        button.classList.toggle('primary', button.dataset.reference3dBackdropMode === mode);
        button.classList.toggle('secondary', button.dataset.reference3dBackdropMode !== mode);
    });
    updateReference3DSkyboxStatus();
    if (hasReference3DBackdropMinimumFaces()) applyReference3DSkybox();
    scheduleReference3DSceneSave(true);
}

async function setReference3DSkyboxSlot(index, file) {
    if (!file) return;
    if (!isReference3DImageFile(file)) {
        showToast('请选择图片文件', 'warning');
        return;
    }
    await initReference3DMode();
    if (index < 0 || index > 5) return;
    try {
        const dataUrl = await readReference3DFileAsDataUrl(file);
        reference3D.skyboxFiles[index] = { name: file.name, dataUrl };
        if (reference3D.skyboxPreviewUrls[index]) URL.revokeObjectURL(reference3D.skyboxPreviewUrls[index]);
        reference3D.skyboxPreviewUrls[index] = dataUrl;
        updateReference3DSkyboxStatus();
        if (hasReference3DBackdropMinimumFaces()) applyReference3DSkybox();
        scheduleReference3DSceneSave(true);
    } catch (e) {
        showToast('布景贴图读取失败', 'error');
    }
}

function hasReference3DBackdropMinimumFaces() {
    return [0, 1, 3, 4].every(index => !!reference3D.skyboxFiles[index]);
}

function updateReference3DSkyboxStatus() {
    const status = document.getElementById('reference3DSkyboxStatus');
    const labels = ['右', '左', '上', '下', '前', '后'];
    const requiredLabels = ['右', '左', '下', '前'];
    const filled = reference3D.skyboxFiles
        .map((file, index) => file ? labels[index] : null)
        .filter(Boolean);
    reference3D.skyboxPreviewUrls.forEach((url, index) => {
        const slot = document.querySelector(`[data-skybox-slot="${index}"]`);
        const img = document.getElementById(`reference3DSkyboxPreview${index}`);
        if (slot) slot.classList.toggle('filled', !!url);
        if (!img) return;
        if (url) {
            img.src = url;
            img.classList.remove('hidden');
        } else {
            img.removeAttribute('src');
            img.classList.add('hidden');
        }
    });
    if (!status) return;
    const modeLabel = getReference3DBackdropModeLabel();
    if (filled.length === 6) {
        status.textContent = `${modeLabel} 6 个面已填充并应用，可作为完整伪 3D 场景截图。`;
        return;
    }
    if (hasReference3DBackdropMinimumFaces()) {
        status.textContent = `${modeLabel}已填充 ${filled.length}/6：${filled.join('、')}。核心 4 面已满足，可继续补充顶部或后方。`;
        return;
    }
    status.textContent = `${modeLabel}已填充 ${filled.length}/6：${filled.length ? filled.join('、') : '暂无'}。至少需要 ${requiredLabels.join('、')} 4 面。`;
}

function applyReference3DSkybox() {
    const THREE = reference3D.THREE;
    if (!hasReference3DBackdropMinimumFaces()) {
        updateReference3DSkyboxStatus();
        return;
    }
    const loader = new THREE.TextureLoader();
    const faceEntries = reference3D.skyboxFiles
        .map((file, index) => file ? { file, index, url: file.dataUrl || URL.createObjectURL(file) } : null)
        .filter(Boolean);
    let remaining = faceEntries.length;
    const textures = new Array(6).fill(null);
    const fail = error => {
        console.error(error);
        textures.forEach(texture => texture?.dispose?.());
        faceEntries.forEach(entry => URL.revokeObjectURL(entry.url));
        showToast('布景盒加载失败', 'error');
    };

    faceEntries.forEach(({ url, index }) => {
        loader.load(url, texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            textures[index] = texture;
            remaining -= 1;
            if (remaining > 0) return;

            disposeReference3DBackground();
            reference3D.backgroundUrls = faceEntries.map(entry => entry.url);
            reference3D.scene.background = new THREE.Color(0x111827);
            reference3D.skyboxMesh = createReference3DBackdropMesh(textures);
            reference3D.scene.add(reference3D.skyboxMesh);
            alignReference3DSceneToSkyboxBottom();
            updateReference3DSkyboxStatus();
            scheduleReference3DSceneSave(true);
            showToast(`已设置${getReference3DBackdropModeLabel()}场景`, 'success');
        }, undefined, fail);
    });
}

function createReference3DBackdropMaterial(texture) {
    const THREE = reference3D.THREE;
    return new THREE.MeshBasicMaterial({
        map: texture || null,
        color: texture ? 0xffffff : 0x111827,
        transparent: !texture,
        opacity: texture ? 1 : 0,
        side: THREE.BackSide,
        depthWrite: true,
        depthTest: true,
        toneMapped: false
    });
}

function createReference3DBackdropMesh(textures) {
    if (reference3D.backdropMode === 'curved') return createReference3DCurvedBackdropMesh(textures);
    return createReference3DBoxBackdropMesh(textures);
}

function createReference3DBoxBackdropMesh(textures) {
    const THREE = reference3D.THREE;
    const materials = textures.map(texture => createReference3DBackdropMaterial(texture));
    const width = 12;
    const height = 6;
    const depth = 12;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials);
    mesh.name = '方形布景盒';
    mesh.renderOrder = -100;
    mesh.frustumCulled = false;
    mesh.userData.reference3DBackground = true;
    mesh.userData.backdropMode = 'box';
    mesh.userData.backdropWidth = width;
    mesh.userData.backdropHeight = height;
    mesh.userData.backdropDepth = depth;
    mesh.position.set(0, height / 2, 0);
    return mesh;
}

function createReference3DCurvedBackdropMesh(textures) {
    const THREE = reference3D.THREE;
    const radius = 7;
    const height = 6;
    const group = new THREE.Group();
    group.name = '圆弧布景';
    group.renderOrder = -100;
    group.frustumCulled = false;
    group.userData.reference3DBackground = true;
    group.userData.backdropMode = 'curved';
    group.userData.backdropRadius = radius;
    group.userData.backdropHeight = height;
    group.position.set(0, height / 2, 0);

    const sideFaces = [
        { index: 1, start: Math.PI * 0.08, length: Math.PI * 0.28, name: '左侧弧墙' },
        { index: 4, start: Math.PI * 0.36, length: Math.PI * 0.28, name: '前方弧墙' },
        { index: 0, start: Math.PI * 0.64, length: Math.PI * 0.28, name: '右侧弧墙' },
        { index: 5, start: Math.PI * 0.92, length: Math.PI * 0.22, name: '后方补墙' }
    ];

    sideFaces.forEach(face => {
        const texture = textures[face.index] || null;
        if (!texture) return;
        const material = createReference3DBackdropMaterial(texture);
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 48, 1, true, face.start, face.length);
        const wall = new THREE.Mesh(geometry, material);
        wall.name = face.name;
        wall.position.set(0, 0, 0);
        wall.userData.reference3DBackground = true;
        group.add(wall);
    });

    const topTexture = textures[2] || null;
    if (topTexture) {
        const top = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 48),
            new THREE.MeshBasicMaterial({ map: topTexture, side: THREE.BackSide, toneMapped: false })
        );
        top.name = '顶部';
        top.rotation.x = Math.PI / 2;
        top.position.y = height / 2;
        top.userData.reference3DBackground = true;
        group.add(top);
    }

    return group;
}

function alignReference3DSceneToSkyboxBottom() {
    const skyboxMesh = reference3D.skyboxMesh;
    const groundPlane = reference3D.groundPlane;
    const gridHelper = reference3D.gridHelper;
    if (!skyboxMesh || !groundPlane || !gridHelper) return;

    const mode = skyboxMesh.userData?.backdropMode || 'box';
    const boxHeight = skyboxMesh.userData?.backdropHeight;
    const bottomY = skyboxMesh.position.y - boxHeight / 2;
    if (!Number.isFinite(boxHeight)) return;

    groundPlane.position.set(skyboxMesh.position.x, bottomY + 0.01, skyboxMesh.position.z);
    gridHelper.position.set(skyboxMesh.position.x, bottomY + 0.02, skyboxMesh.position.z);

    if (mode === 'curved') {
        const radius = skyboxMesh.userData?.backdropRadius;
        if (!Number.isFinite(radius)) return;
        const diameter = radius * 2;
        groundPlane.scale.set(diameter, diameter, 1);
        gridHelper.scale.set(diameter / 12, 1, diameter / 12);
        return;
    }

    const boxWidth = skyboxMesh.userData?.backdropWidth;
    const boxDepth = skyboxMesh.userData?.backdropDepth;
    if (!Number.isFinite(boxWidth) || !Number.isFinite(boxDepth)) return;
    groundPlane.scale.set(boxWidth, boxDepth, 1);
    gridHelper.scale.set(boxWidth / 12, 1, boxDepth / 12);
}

function createReference3DGroundPlane() {
    const THREE = reference3D.THREE;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x2f3542,
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.name = '地面平面';
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.01;
    ground.receiveShadow = true;
    ground.visible = reference3D.groundVisible;
    ground.scale.set(12, 12, 1);
    return ground;
}

function loadReference3DGroundTextureFromDataUrl(dataUrl, silent = false) {
    const THREE = reference3D.THREE;
    const ground = reference3D.groundPlane;
    if (!THREE || !ground || !dataUrl) return;
    new THREE.TextureLoader().load(dataUrl, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(32, 32);
        if (ground.material.map) ground.material.map.dispose();
        if (reference3D.groundTextureUrl) URL.revokeObjectURL(reference3D.groundTextureUrl);
        ground.material.map = texture;
        ground.material.color.set(0xffffff);
        ground.material.needsUpdate = true;
        reference3D.groundTextureUrl = null;
        reference3D.groundSourceDataUrl = dataUrl;
        reference3D.groundVisible = true;
        ground.visible = true;
        if (!silent) showToast('已设置地面贴图', 'success');
        scheduleReference3DSceneSave(true);
    }, undefined, error => {
        console.error(error);
        if (!silent) showToast('地面贴图加载失败', 'error');
    });
}

async function setReference3DGroundTexture(file) {
    if (!file) return;
    await initReference3DMode();
    if (!isReference3DImageFile(file)) {
        showToast('请选择图片文件', 'warning');
        return;
    }
    try {
        loadReference3DGroundTextureFromDataUrl(await readReference3DFileAsDataUrl(file));
    } catch (e) {
        showToast('地面贴图读取失败', 'error');
    }
}

function toggleReference3DGround() {
    initReference3DMode();
    reference3D.groundVisible = !reference3D.groundVisible;
    if (reference3D.groundPlane) reference3D.groundPlane.visible = reference3D.groundVisible;
    scheduleReference3DSceneSave();
    showToast(reference3D.groundVisible ? '已显示地面' : '已隐藏地面', 'info');
}

function toggleReference3DGrid() {
    initReference3DMode();
    reference3D.gridVisible = !reference3D.gridVisible;
    if (reference3D.gridHelper) reference3D.gridHelper.visible = reference3D.gridVisible;
    scheduleReference3DSceneSave();
    showToast(reference3D.gridVisible ? '已显示网格辅助线' : '已隐藏网格辅助线', 'info');
}

function setReference3DBackgroundPlane(texture) {
    const THREE = reference3D.THREE;
    const material = new THREE.MeshBasicMaterial({ map: texture, depthTest: false, depthWrite: false, toneMapped: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.name = '单张背景图';
    plane.renderOrder = -1000;
    plane.position.set(0, 0, -80);
    plane.userData.reference3DBackground = true;
    reference3D.scene.background = new THREE.Color(0x111827);
    reference3D.backgroundPlane = plane;
    reference3D.backgroundTexture = texture;
    reference3D.camera.add(plane);
    updateReference3DBackgroundPlaneSize();
}

function updateReference3DBackgroundPlaneSize() {
    const plane = reference3D.backgroundPlane;
    const texture = reference3D.backgroundTexture;
    const camera = reference3D.camera;
    if (!plane || !texture || !camera) return;
    const image = texture.image || {};
    const imageAspect = image.width && image.height ? image.width / image.height : 1;
    const viewAspect = camera.aspect || 1;
    const distance = Math.abs(plane.position.z);
    const viewHeight = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * distance;
    const viewWidth = viewHeight * viewAspect;
    let width = viewWidth;
    let height = viewHeight;
    if (imageAspect > viewAspect) {
        height = viewWidth / imageAspect;
    } else {
        width = viewHeight * imageAspect;
    }
    plane.scale.set(width, height, 1);
}

function disposeReference3DBackground() {
    const background = reference3D.scene?.background;
    if (background?.isTexture) background.dispose();
    if (reference3D.skyboxMesh) {
        reference3D.skyboxMesh.parent?.remove(reference3D.skyboxMesh);
        reference3D.skyboxMesh.geometry?.dispose();
        const materials = Array.isArray(reference3D.skyboxMesh.material) ? reference3D.skyboxMesh.material : [reference3D.skyboxMesh.material];
        materials.forEach(material => {
            material?.map?.dispose();
            material?.dispose?.();
        });
        reference3D.skyboxMesh = null;
    }
    if (reference3D.backgroundPlane) {
        reference3D.backgroundPlane.parent?.remove(reference3D.backgroundPlane);
        reference3D.backgroundPlane.geometry?.dispose();
        reference3D.backgroundPlane.material?.dispose();
        reference3D.backgroundPlane = null;
    }
    if (reference3D.backgroundTexture) {
        reference3D.backgroundTexture.dispose();
        reference3D.backgroundTexture = null;
    }
    if (reference3D.backgroundUrls) reference3D.backgroundUrls.forEach(URL.revokeObjectURL);
    reference3D.backgroundUrls = [];
    reference3D.backgroundSourceDataUrl = '';
}

function disposeReference3DGround() {
    if (reference3D.groundTextureUrl) {
        URL.revokeObjectURL(reference3D.groundTextureUrl);
        reference3D.groundTextureUrl = null;
    }
    const material = reference3D.groundPlane?.material;
    if (material?.map) {
        material.map.dispose();
        material.map = null;
        material.color?.set(0x2f3542);
        material.needsUpdate = true;
    }
}

function selectReference3DObject(object) {
    reference3D.selected = object;
    if (object) {
        reference3D.transform?.attach(object);
    } else {
        reference3D.transform?.detach();
    }
    syncReference3DTransformInputs();
    renderReference3DObjectList();
}

function resetReference3DCamera() {
    initReference3DMode();
    reference3D.camera.fov = REFERENCE3D_DEFAULT_FOV;
    setReference3DCameraView(new reference3D.THREE.Vector3(0, 1, 0), 7, 0.55, -0.45);
    scheduleReference3DSceneSave();
}

function setReference3DCameraView(target, distance, yaw = 0.55, pitch = -0.35) {
    const THREE = reference3D.THREE;
    const camera = reference3D.camera;
    if (!THREE || !camera) return;
    const offset = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch) * distance,
        Math.sin(-pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance
    );
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    camera.rotation.order = 'YXZ';
    camera.fov = clampReference3DFov(camera.fov || REFERENCE3D_DEFAULT_FOV);
    camera.updateProjectionMatrix();
    reference3D.ueControls.yaw = camera.rotation.y;
    reference3D.ueControls.pitch = camera.rotation.x;
    syncReference3DCameraInputs();
}

function getReference3DSceneBox(objects = reference3D.selectable) {
    const THREE = reference3D.THREE;
    if (!THREE) return null;
    const box = new THREE.Box3();
    let hasObject = false;
    objects.forEach(object => {
        if (!object) return;
        const objectBox = new THREE.Box3().setFromObject(object);
        if (!Number.isFinite(objectBox.min.x)) return;
        box.union(objectBox);
        hasObject = true;
    });
    return hasObject ? box : null;
}

function focusReference3DAll() {
    initReference3DMode();
    const THREE = reference3D.THREE;
    const box = getReference3DSceneBox();
    if (!THREE || !box) {
        setReference3DCameraView(new THREE.Vector3(0, 1, 0), 7, 0.55, -0.45);
        showToast('暂无角色或物体，已回到默认全场视角', 'info');
        return;
    }
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const distance = Math.max(4, Math.max(size.x, size.y, size.z) * 2.2);
    setReference3DCameraView(center, distance, 0.65, -0.42);
    scheduleReference3DSceneSave();
    showToast('已切换到全场视角', 'success');
}

function focusReference3DSelected() {
    initReference3DMode();
    const THREE = reference3D.THREE;
    const object = reference3D.selected;
    if (!THREE || !object) {
        showToast('请先选中一个角色或物体', 'warning');
        return;
    }
    const box = getReference3DSceneBox([object]);
    if (!box) return;
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const distance = Math.max(2.8, Math.max(size.x, size.y, size.z) * 2.4);
    setReference3DCameraView(center, distance, 0.55, -0.35);
    scheduleReference3DSceneSave();
    showToast('已聚焦选中物体', 'success');
}

function syncReference3DTransformInputs() {
    const object = reference3D.selected;
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };
    setValue('reference3DName', object?.name || '');
    ['X', 'Y', 'Z'].forEach(axis => {
        setValue(`reference3DPos${axis}`, object ? object.position[axis.toLowerCase()].toFixed(2) : '');
        setValue(`reference3DRot${axis}`, object ? (object.rotation[axis.toLowerCase()] * 180 / Math.PI).toFixed(0) : '');
        setValue(`reference3DScale${axis}`, object ? object.scale[axis.toLowerCase()].toFixed(2) : '');
    });
}

function updateReference3DSelectedTransform() {
    const object = reference3D.selected;
    if (!object) return;
    const read = (id, fallback) => {
        const value = Number(document.getElementById(id)?.value);
        return Number.isFinite(value) ? value : fallback;
    };
    object.position.set(read('reference3DPosX', object.position.x), read('reference3DPosY', object.position.y), read('reference3DPosZ', object.position.z));
    object.rotation.set(
        read('reference3DRotX', object.rotation.x * 180 / Math.PI) * Math.PI / 180,
        read('reference3DRotY', object.rotation.y * 180 / Math.PI) * Math.PI / 180,
        read('reference3DRotZ', object.rotation.z * 180 / Math.PI) * Math.PI / 180
    );
    object.scale.set(
        Math.max(0.01, read('reference3DScaleX', object.scale.x)),
        Math.max(0.01, read('reference3DScaleY', object.scale.y)),
        Math.max(0.01, read('reference3DScaleZ', object.scale.z))
    );
    renderReference3DObjectList();
    scheduleReference3DSceneSave();
}

function renameReference3DSelected(value) {
    if (!reference3D.selected) return;
    reference3D.selected.name = (value || '').trim() || reference3D.selected.name;
    renderReference3DObjectList();
    scheduleReference3DSceneSave();
}

function groundReference3DSelected() {
    const object = reference3D.selected;
    if (!object) {
        showToast('请先选中一个物体', 'warning');
        return;
    }
    const THREE = reference3D.THREE;
    const box = new THREE.Box3().setFromObject(object);
    if (!Number.isFinite(box.min.y)) return;
    object.position.y -= box.min.y;
    syncReference3DTransformInputs();
    scheduleReference3DSceneSave();
    showToast('已将选中物体贴合到地面', 'success');
}

function deleteReference3DSelected() {
    const object = reference3D.selected;
    if (!object) {
        showToast('请先选中一个物体', 'warning');
        return;
    }
    removeReference3DObject(object);
    selectReference3DObject(null);
    renderReference3DObjectList();
    scheduleReference3DSceneSave(object.userData?.kind === 'image-plane');
}

function clearReference3DScene() {
    if (!reference3D.scene) return;
    const hadImagePlanes = reference3D.selectable.some(object => object.userData?.kind === 'image-plane');
    reference3D.selectable.slice().forEach(removeReference3DObject);
    selectReference3DObject(null);
    renderReference3DObjectList();
    scheduleReference3DSceneSave(hadImagePlanes);
    showToast('已清空 3D 场景物体', 'success');
}

function removeReference3DObject(object) {
    reference3D.transform?.detach();
    reference3D.scene?.remove(object);
    reference3D.selectable = reference3D.selectable.filter(item => item !== object);
    reference3D.mixers = reference3D.mixers.filter(mixer => mixer.userData?.root !== object);
    object.traverse?.(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose?.();
            });
        }
    });
    if (object.userData.objectUrl) URL.revokeObjectURL(object.userData.objectUrl);
}

function renderReference3DObjectList() {
    const list = document.getElementById('reference3DObjectList');
    if (!list) return;
    if (!reference3D.selectable.length) {
        list.innerHTML = '<div class="empty-state"><p>暂无物体，请先导入图片或模型。</p></div>';
        return;
    }
    list.innerHTML = reference3D.selectable.map((object, index) => `
        <button class="reference-3d-object-item ${object === reference3D.selected ? 'active' : ''}" onclick="selectReference3DObject(reference3D.selectable[${index}])">
            <span>${escHtml(object.name || `物体 ${index + 1}`)}</span>
            <small>${getReference3DObjectKindLabel(object)}</small>
        </button>
    `).join('');
}

function getReference3DObjectKindLabel(object) {
    const kind = object?.userData?.kind;
    if (kind === 'model') return '模型';
    if (kind === 'character') return '角色';
    if (kind === 'person-box') return '人物';
    if (kind === 'image-plane') return '图片平面';
    return '物体';
}

function ue5VectorToReference3DPosition(pos = {}) {
    return {
        x: numberOr(pos.x, 0) / 100,
        y: numberOr(pos.z, 0) / 100,
        z: numberOr(pos.y, 0) / 100
    };
}

function reference3DPositionToUe5Vector(pos = {}) {
    return {
        x: roundUe5Number(numberOr(pos.x, 0) * 100),
        y: roundUe5Number(numberOr(pos.z, 0) * 100),
        z: roundUe5Number(numberOr(pos.y, 0) * 100)
    };
}

function ue5RotationToReference3DCharacterRotation(rot = {}) {
    return {
        x: 0,
        y: 90 - numberOr(rot.z, 0),
        z: 0
    };
}

function ue5RotationToReference3DDirection(rot = {}) {
    const yaw = degToRad(numberOr(rot.z, 0));
    const pitch = degToRad(numberOr(rot.y, 0));
    const cp = Math.cos(pitch);
    return {
        x: Math.cos(yaw) * cp,
        y: Math.sin(pitch),
        z: Math.sin(yaw) * cp
    };
}

function getReference3DCameraAsUe5Camera(existingRoll = 0) {
    const camera = reference3D.camera;
    const THREE = reference3D.THREE;
    if (!camera || !THREE) return null;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const yaw = Math.atan2(direction.z, direction.x) * 180 / Math.PI;
    const ground = Math.hypot(direction.x, direction.z);
    const pitch = Math.atan2(direction.y, ground) * 180 / Math.PI;
    return {
        pos: reference3DPositionToUe5Vector(camera.position),
        rot: {
            x: roundUe5Number(existingRoll),
            y: roundUe5Number(pitch),
            z: roundUe5Number(yaw)
        },
        fov: roundUe5Number(clampReference3DFov(camera.fov), 2)
    };
}

function applyReference3DUe5Camera(cameraData = {}) {
    const camera = reference3D.camera;
    const THREE = reference3D.THREE;
    if (!camera || !THREE) return;
    const pos = ue5VectorToReference3DPosition(cameraData.position || cameraData.pos || {});
    const directionData = ue5RotationToReference3DDirection(cameraData.rotation || cameraData.rot || {});
    const direction = new THREE.Vector3(directionData.x, directionData.y, directionData.z).normalize();
    camera.position.set(pos.x, pos.y, pos.z);
    camera.up.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z).add(direction));
    camera.rotation.order = 'YXZ';
    camera.fov = clampReference3DFov(numberOr(cameraData.fov, camera.fov || REFERENCE3D_DEFAULT_FOV));
    camera.updateProjectionMatrix();
    reference3D.ueControls.yaw = camera.rotation.y;
    reference3D.ueControls.pitch = camera.rotation.x;
    resizeReference3DRenderer();
    syncReference3DCameraInputs();
}

async function importControlDataToReference3D(controlData) {
    await initReference3DMode();
    if (!reference3D.initialized || !reference3D.THREE) {
        showToast('3D 引擎未加载完成，无法导入控制数据', 'error');
        return;
    }
    const data = typeof controlData === 'string' ? JSON.parse(controlData) : controlData;
    const isUe5 = data?.coordinateSpace === 'ue5';
    const charactersData = Array.isArray(data?.characters) ? data.characters : [];
    if (!charactersData.length && !data?.camera) {
        showToast('控制数据中没有角色或摄像机信息', 'warning');
        return;
    }

    reference3D.selectable.slice().forEach(removeReference3DObject);
    selectReference3DObject(null);

    for (let i = 0; i < charactersData.length; i++) {
        await addReference3DCharacterFromControl(charactersData[i], i, { coordinateSpace: isUe5 ? 'ue5' : '' });
    }
    reference3D.ueJsonLink = data?.ue5Link || null;
    applyReference3DCameraFromControl(data.camera || {}, { coordinateSpace: isUe5 ? 'ue5' : '' });
    renderReference3DObjectList();
    switchToTab('reference-3d');
    showToast(`已导入3D摄影控制数据：${charactersData.length}个角色和摄像机角度`, 'success');
}

function addReference3DCharacterFromControl(charData, index = 0, options = {}) {
    const isUe5 = options.coordinateSpace === 'ue5';
    const position = isUe5
        ? ue5VectorToReference3DPosition(charData?.position || {})
        : {
            x: numberOr(charData?.position?.x, index - 1),
            y: numberOr(charData?.position?.y, 0),
            z: numberOr(charData?.position?.z, 0)
        };
    const rotation = isUe5
        ? ue5RotationToReference3DCharacterRotation(charData?.rotation || {})
        : {
            x: numberOr(charData?.rotation?.x, 0),
            y: numberOr(charData?.rotation?.y, 0),
            z: numberOr(charData?.rotation?.z, 0)
        };
    return addReference3DXBotCharacter({
        name: charData?.name || `角色 ${index + 1}`,
        position,
        rotation
    });
}

function applyReference3DCameraFromControl(cameraData, options = {}) {
    const camera = reference3D.camera;
    if (!camera) return;
    if (options.coordinateSpace === 'ue5') {
        applyReference3DUe5Camera(cameraData);
        scheduleReference3DSceneSave();
        return;
    }
    const pos = cameraData?.position || {};
    const rot = cameraData?.rotation || {};
    camera.position.set(numberOr(pos.x, 0), numberOr(pos.y, 1.6), numberOr(pos.z, 6));
    camera.rotation.order = 'YXZ';
    camera.rotation.set(degToRad(numberOr(rot.x, -8)), degToRad(numberOr(rot.y, 0)), degToRad(numberOr(rot.z, 0)));
    camera.fov = clampReference3DFov(numberOr(cameraData?.fov, camera.fov || REFERENCE3D_DEFAULT_FOV));
    camera.updateProjectionMatrix();
    reference3D.ueControls.yaw = camera.rotation.y;
    reference3D.ueControls.pitch = camera.rotation.x;
    resizeReference3DRenderer();
    syncReference3DCameraInputs();
    scheduleReference3DSceneSave();
}

function syncReference3DCameraInputs() {
    const cameraData = getReference3DCameraAsUe5Camera(getSelectedUe5Camera()?.rot?.x || 0);
    if (!cameraData) return;
    setUe5InputValue('reference3DCamPosX', cameraData.pos.x);
    setUe5InputValue('reference3DCamPosY', cameraData.pos.y);
    setUe5InputValue('reference3DCamPosZ', cameraData.pos.z);
    setUe5InputValue('reference3DCamRotX', cameraData.rot.x);
    setUe5InputValue('reference3DCamRotY', cameraData.rot.y);
    setUe5InputValue('reference3DCamRotZ', cameraData.rot.z);
    setUe5InputValue('reference3DCamFov', cameraData.fov, 2);
}

function applyReference3DCameraInputs() {
    if (!reference3D.camera) return;
    const cameraData = {
        position: {
            x: readNumberInput('reference3DCamPosX', 0),
            y: readNumberInput('reference3DCamPosY', 0),
            z: readNumberInput('reference3DCamPosZ', 160)
        },
        rotation: {
            x: readNumberInput('reference3DCamRotX', 0),
            y: readNumberInput('reference3DCamRotY', 0),
            z: readNumberInput('reference3DCamRotZ', 90)
        },
        fov: readNumberInput('reference3DCamFov', REFERENCE3D_DEFAULT_FOV)
    };
    applyReference3DUe5Camera(cameraData);
    scheduleReference3DSceneSave();
    const status = document.getElementById('reference3DCameraStatus');
    if (status) status.textContent = '已应用当前摄影机参数。';
}

function writeReference3DCameraToUe5Json() {
    if (!ue5JsonLastResult?.shots?.length) {
        showToast('导入引擎里还没有可回写的 UE JSON', 'warning');
        return;
    }
    const link = reference3D.ueJsonLink || {
        shotIndex: ue5JsonEditorState.shotIndex || 0,
        cameraKeyIndex: ue5JsonEditorState.cameraKeyIndex || 0
    };
    const shot = ue5JsonLastResult.shots?.[link.shotIndex];
    const camera = shot?.camera?.[link.cameraKeyIndex];
    if (!shot || !camera) {
        showToast('找不到对应的 UE 镜头关键帧，请在导入引擎重新选择镜头再导入3D', 'warning');
        return;
    }
    const cameraData = getReference3DCameraAsUe5Camera(camera.rot?.x || 0);
    if (!cameraData) return;
    camera.pos = cameraData.pos;
    camera.rot = cameraData.rot;
    camera.fov = cameraData.fov;
    ue5JsonEditorState.shotIndex = link.shotIndex;
    ue5JsonEditorState.cameraKeyIndex = link.cameraKeyIndex;
    updateUe5JsonPreviewAfterEdit();
    refreshUe5CameraSelectors();
    syncUe5CameraEditorFromSelection();
    const status = document.getElementById('reference3DCameraStatus');
    if (status) status.textContent = `已回写到镜头 ${link.shotIndex + 1} / Key ${link.cameraKeyIndex + 1}。`;
    showToast('已把当前3D摄影机参数回写到 UE JSON', 'success');
}

function scheduleReference3DSceneSave() {
    if (reference3D.restoring) return;
    if (reference3D.saveTimer) clearTimeout(reference3D.saveTimer);
    reference3D.saveTimer = setTimeout(saveReference3DScene, 300);
}

function getReference3DCameraState() {
    const camera = reference3D.camera;
    if (!camera) return null;
    return {
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        rotation: { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z },
        fov: clampReference3DFov(camera.fov)
    };
}

function applyReference3DCameraState(state) {
    const camera = reference3D.camera;
    if (!camera || !state) return;
    const pos = state.position || {};
    const rot = state.rotation || {};
    camera.position.set(numberOr(pos.x, camera.position.x), numberOr(pos.y, camera.position.y), numberOr(pos.z, camera.position.z));
    camera.rotation.order = 'YXZ';
    camera.rotation.set(numberOr(rot.x, camera.rotation.x), numberOr(rot.y, camera.rotation.y), numberOr(rot.z, camera.rotation.z));
    camera.fov = clampReference3DFov(state.fov || camera.fov || REFERENCE3D_DEFAULT_FOV);
    camera.updateProjectionMatrix();
    reference3D.ueControls.yaw = camera.rotation.y;
    reference3D.ueControls.pitch = camera.rotation.x;
    syncReference3DCameraInputs();
}

function serializeReference3DObject(object) {
    if (!object) return null;
    const kind = object.userData?.kind || '';
    if (kind !== 'image-plane') return null;
    return {
        kind,
        name: object.name || '',
        position: { x: object.position.x, y: object.position.y, z: object.position.z },
        rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
        scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z },
        sourceDataUrl: object.userData?.sourceDataUrl || ''
    };
}

function saveReference3DScene() {
    if (!reference3D.initialized || reference3D.restoring) return;
    const payload = {
        version: 2,
        backdropMode: reference3D.backdropMode,
        skyboxFiles: reference3D.skyboxFiles.map(file => file?.dataUrl ? { name: file.name || '', dataUrl: file.dataUrl } : null),
        backgroundSourceDataUrl: reference3D.backgroundSourceDataUrl || '',
        groundSourceDataUrl: reference3D.groundSourceDataUrl || '',
        groundVisible: reference3D.groundVisible,
        gridVisible: reference3D.gridVisible,
        camera: getReference3DCameraState(),
        ueJsonLink: reference3D.ueJsonLink || null,
        objects: reference3D.selectable.map(serializeReference3DObject).filter(Boolean)
    };
    try {
        localStorage.setItem(REFERENCE3D_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('保存3D场景失败:', e);
        showToast('3D场景保存失败：浏览器本地存储空间不足，请减少贴图尺寸或数量', 'warning');
    }
}

async function restoreReference3DScene() {
    if (reference3D.restored) return;
    reference3D.restored = true;
    const raw = localStorage.getItem(REFERENCE3D_STORAGE_KEY);
    if (!raw) return;
    let data = null;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.warn('读取3D场景失败:', e);
        return;
    }
    if (!data || typeof data !== 'object') return;

    reference3D.restoring = true;
    try {
        reference3D.backdropMode = ['box', 'curved'].includes(data.backdropMode) ? data.backdropMode : 'box';
        document.querySelectorAll('[data-reference3d-backdrop-mode]').forEach(button => {
            button.classList.toggle('primary', button.dataset.reference3dBackdropMode === reference3D.backdropMode);
            button.classList.toggle('secondary', button.dataset.reference3dBackdropMode !== reference3D.backdropMode);
        });

        reference3D.groundVisible = data.groundVisible !== false;
        reference3D.gridVisible = data.gridVisible !== false;
        reference3D.ueJsonLink = data.ueJsonLink || null;
        if (reference3D.groundPlane) reference3D.groundPlane.visible = reference3D.groundVisible;
        if (reference3D.gridHelper) reference3D.gridHelper.visible = reference3D.gridVisible;

        if (data.backgroundSourceDataUrl) loadReference3DSingleBackgroundFromDataUrl(data.backgroundSourceDataUrl, true);
        if (data.groundSourceDataUrl) loadReference3DGroundTextureFromDataUrl(data.groundSourceDataUrl, true);

        if (Array.isArray(data.skyboxFiles)) {
            reference3D.skyboxFiles = data.skyboxFiles.map(file => file?.dataUrl ? { name: file.name || '', dataUrl: file.dataUrl } : null).slice(0, 6);
            while (reference3D.skyboxFiles.length < 6) reference3D.skyboxFiles.push(null);
            reference3D.skyboxPreviewUrls = reference3D.skyboxFiles.map(file => file?.dataUrl || null);
            updateReference3DSkyboxStatus();
            if (hasReference3DBackdropMinimumFaces()) applyReference3DSkybox();
        }

        const objects = Array.isArray(data.objects) ? data.objects : [];
        for (const item of objects) {
            if (item?.kind === 'image-plane' && item.sourceDataUrl) {
                await addReference3DImagePlaneFromDataUrl(item.sourceDataUrl, item.name || '图片平面', item);
            }
        }

        applyReference3DCameraState(data.camera);
        renderReference3DObjectList();
    } finally {
        reference3D.restoring = false;
        syncReference3DCameraInputs();
    }
}

function applyReference3DObjectState(object, state) {
    const pos = state.position || {};
    const rot = state.rotation || {};
    const scale = state.scale || {};
    object.name = state.name || object.name;
    object.position.set(numberOr(pos.x, object.position.x), numberOr(pos.y, object.position.y), numberOr(pos.z, object.position.z));
    object.rotation.set(numberOr(rot.x, object.rotation.x), numberOr(rot.y, object.rotation.y), numberOr(rot.z, object.rotation.z));
    object.scale.set(
        Math.max(0.01, numberOr(scale.x, object.scale.x)),
        Math.max(0.01, numberOr(scale.y, object.scale.y)),
        Math.max(0.01, numberOr(scale.z, object.scale.z))
    );
}

function addReference3DImagePlaneFromDataUrl(dataUrl, name, state = {}) {
    return new Promise(resolve => {
        const THREE = reference3D.THREE;
        new THREE.TextureLoader().load(dataUrl, texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const image = texture.image || {};
            const aspect = image.width && image.height ? image.width / image.height : 1;
            const height = 2.4;
            const width = Math.max(0.3, height * aspect);
            const geometry = new THREE.PlaneGeometry(width, height);
            geometry.translate(0, height / 2, 0);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = name || '图片平面';
            mesh.userData.reference3DSelectable = true;
            mesh.userData.sourceDataUrl = dataUrl;
            mesh.userData.kind = 'image-plane';
            reference3D.scene.add(mesh);
            reference3D.selectable.push(mesh);
            applyReference3DObjectState(mesh, state);
            resolve(mesh);
        }, undefined, error => {
            console.error(error);
            resolve(null);
        });
    });
}

function clampReference3DFov(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return REFERENCE3D_DEFAULT_FOV;
    return Math.max(5, Math.min(170, n));
}

function numberOr(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function degToRad(value) {
    return value * Math.PI / 180;
}

function captureReference3DShot() {
    initReference3DMode();
    if (!reference3D.renderer) return;
    resizeReference3DRenderer();
    reference3D.renderer.render(reference3D.scene, reference3D.camera);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `ai-reference-3d-${timestamp}.png`;
    link.href = reference3D.renderer.domElement.toDataURL('image/png');
    link.click();
    showToast('3D参考截图已导出', 'success');
}

// ==================== 工具函数 ====================
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text || '');
        showToast('已复制到剪贴板', 'success');
    } catch (e) {
        showToast('复制失败: ' + e.message, 'error');
    }
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escAttr(str) {
    return String(str || '')
        .replace(/&/g, '\u0026amp;')
        .replace(/"/g, '\u0026quot;')
        .replace(/'/g, '\u0026#39;')
        .replace(/</g, '\u0026lt;')
        .replace(/>/g, '\u0026gt;');
}

// ==================== @ 提及（mention）系统 ====================
//
// 后端约定文本中用 `@char:{id}` / `@scene:{id}` 引用素材，也支持 `@提示词标题` 引用提示词库。
// 本前端实现两件事：
//   1. MentionEditor：contenteditable 富文本编辑器，徽章原子化、IME 兼容、自定义撤销
//   2. mention picker 选择浮层：用于编辑器内 @ 触发或 "插入素材" 按钮触发
//
// 兼容老数据：如果文本里有 `[图N]` 但没有 @ 标记，会按片段的 reference_images
// 反查素材，把 [图N] 显示为对应徽章（仅显示层兼容，不修改存储）。

const MENTION_REGEX_GLOBAL = /@(char|scene):([A-Za-z0-9_\-]{1,64})/g;
const LEGACY_REF_REGEX_GLOBAL = /\[图\s*(\d+)\s*\]/g;
const MENTION_BOUNDARY_RE = /[\s\u4e00-\u9fff，。、；：！？（）「」【】]/;

function lookupMentionAsset(kind, id) {
    if (!id) return null;
    if (kind === 'char') return characters.find(c => c.id === id) || null;
    if (kind === 'scene') return scenes.find(s => s.id === id) || null;
    if (kind === 'prompt') return promptLibrary.find(p => p.id === id || p.title === id) || null;
    return null;
}

function getMentionDisplayLabel(kind, id, asset) {
    if (kind === 'prompt') {
        const title = (asset && asset.title) || id || '已失效提示词';
        return asset ? `💬 @${title}` : `⚠ @${title}`;
    }
    if (asset && asset.name) {
        return (kind === 'char' ? '👤 ' : '📍 ') + asset.name;
    }
    return `⚠ 已失效:${id}`;
}

function getMentionChipClass(kind, asset) {
    if (!asset) return 'mention-chip mention-missing';
    if (kind === 'prompt') return 'mention-chip mention-prompt';
    return kind === 'char' ? 'mention-chip mention-char' : 'mention-chip mention-scene';
}

function getPromptMentionTokenRegex() {
    const titles = promptLibrary
        .map(item => String(item.title || '').trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
    if (!titles.length) return null;
    return new RegExp(`@(${titles.map(escapeRegExp).join('|')})${PROMPT_MENTION_END_SOURCE}`, 'gi');
}

// 为只读 HTML 渲染（如老格式展示、日志、tooltip 等场景）保留独立函数
function renderMentionBadgeHtml(kind, id, asset) {
    const cls = getMentionChipClass(kind, asset);
    const label = getMentionDisplayLabel(kind, id, asset);
    const title = asset ? `${kind}:${id}` : `找不到素材 ${kind}:${id}`;
    return `<span class="${cls}" title="${escAttr(title)}">${escHtml(label)}</span>`;
}

function renderMentionsToHtml(text, options) {
    options = options || {};
    if (!text) return '<span class="mention-preview-empty">（空）</span>';

    const safe = escHtml(text);
    let out = safe.replace(MENTION_REGEX_GLOBAL, (full, kind, id) => {
        const asset = lookupMentionAsset(kind, id);
        return renderMentionBadgeHtml(kind, id, asset);
    });
    const promptRe = getPromptMentionTokenRegex();
    if (promptRe) {
        out = out.replace(promptRe, (full, title) => {
            const item = promptLibrary.find(p => String(p.title || '').toLowerCase() === String(title || '').toLowerCase());
            return item ? renderMentionBadgeHtml('prompt', item.id, item) : full;
        });
    }

    const hasModernMention = /@(?:char|scene):[A-Za-z0-9_\-]{1,64}/.test(text);
    if (!hasModernMention && Array.isArray(options.legacyRefImages) && options.legacyRefImages.length) {
        const legacyRefs = options.legacyRefImages;
        out = out.replace(LEGACY_REF_REGEX_GLOBAL, (full, num) => {
            const idx = parseInt(num, 10) - 1;
            if (idx < 0 || idx >= legacyRefs.length) return full;
            const refPath = legacyRefs[idx];
            const charAsset = characters.find(c => c.image_path === refPath);
            const sceneAsset = !charAsset ? scenes.find(s => s.image_path === refPath) : null;
            if (charAsset) return renderMentionBadgeHtml('char', charAsset.id, charAsset);
            if (sceneAsset) return renderMentionBadgeHtml('scene', sceneAsset.id, sceneAsset);
            return `<span class="mention-chip mention-missing" title="老 [图${num}] 找不到对应素材">⚠ 老[图${num}]</span>`;
        });
    }
    out = out.replace(/\n/g, '<br>');
    return out;
}

function getMentionAssetOptions() {
    const charItems = characters.map(c => ({
        type: 'char', id: c.id, name: c.name, label: `👤 ${c.name}`, image_path: c.image_path || '',
        meta: `char:${c.id}`,
        searchText: `人物 ${c.name || ''} char:${c.id || ''}`,
    }));
    const sceneItems = scenes.map(s => ({
        type: 'scene', id: s.id, name: s.name, label: `📍 ${s.name}`, image_path: s.image_path || '',
        meta: `scene:${s.id}`,
        searchText: `场景 ${s.name || ''} scene:${s.id || ''}`,
    }));
    const promptItems = promptLibrary.map(p => ({
        type: 'prompt',
        id: p.id,
        name: p.title,
        title: p.title,
        content: p.content || '',
        label: `💬 @${p.title}`,
        image_path: p.image_path || '',
        meta: '提示词库',
        searchText: `提示词库 @${p.title || ''} ${p.content || ''}`,
    }));
    return charItems.concat(sceneItems, promptItems);
}

/**
 * 从 prompt 文本中按 @ 首次出现顺序提取对应素材图片路径列表。
 * 用于本地 UI 状态展示（seg._libraryImages），后端在视频生成时会重新解析一次保证一致。
 * 未在 @ 中提到的素材不会进入列表；已删除的素材跳过。
 */
function getMentionImagesFromPrompt(text) {
    if (!text) return [];
    const re = /@(char|scene):([A-Za-z0-9_\-]{1,64})/g;
    const seen = new Set();
    const images = [];
    let m;
    while ((m = re.exec(text)) !== null) {
        const key = `${m[1]}:${m[2]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const asset = lookupMentionAsset(m[1], m[2]);
        if (asset && asset.image_path) images.push(asset.image_path);
    }
    return images;
}

/**
 * MentionEditor: contenteditable 富文本编辑器，徽章原子化。
 *
 * 核心数据模型：
 *   编辑器 DOM 只包含 3 类节点：
 *     - 文本节点（普通文字）
 *     - <br>（换行）
 *     - <span class="mention-chip" contenteditable="false" data-mention-type="..." data-mention-id="...">（徽章）
 *   通过 contenteditable=false 让浏览器把徽章当作不可分割的单元处理，自动避开
 *   大量 IME / 光标 / 部分删除的坑。
 *
 * 关键设计：
 *   - 不监听 selectionchange，依赖浏览器原生光标行为
 *   - IME 期间（compositionstart -> compositionend）暂停 @ 触发检测
 *   - 自定义撤销栈：在"原子操作"前打快照，Ctrl+Z 还原
 *   - getValue() 通过遍历 child nodes 序列化，不依赖 innerHTML
 */
class MentionEditor {
    constructor(rootEl, options) {
        this.root = rootEl;
        this.options = options || {};
        this.root.classList.add('mention-editor');
        this.root.setAttribute('contenteditable', 'true');
        this.root.setAttribute('spellcheck', 'false');
        if (this.options.placeholder) {
            this.root.dataset.placeholder = this.options.placeholder;
        }

        this._isComposing = false;
        this._undoStack = [];
        this._redoStack = [];
        this._lastSnapshot = '';
        this._suppressInputEvent = false;
        // 防止短时间内多次快照（如连续打字）
        this._snapshotDebounce = null;
        // 当前 @ trigger 范围（仅在键盘输入 @ 时设置）；用于 insertMention 替换 "@xxx" 段
        this._currentTriggerRange = null;
        // 失焦前最后一次有效 Range：弹出 picker 时保存，insertMention 时恢复
        // 这样用户在浮层里点击选择不会因为 selection 跑到 picker 里而丢失编辑器光标
        this._savedRange = null;

        this._bindEvents();
    }

    // ---------- 公共 API ----------

    setValue(text, options) {
        options = options || {};
        const safeText = text == null ? '' : String(text);
        const legacyRefImages = options.legacyRefImages || [];
        this._renderTextToDom(safeText, legacyRefImages);
        // 重置撤销栈（外部 setValue 一般是"加载新内容"，不应保留旧 undo）
        if (!options.keepHistory) {
            this._undoStack = [];
            this._redoStack = [];
            this._lastSnapshot = safeText;
        }
        // setValue 不主动 fire onInput，避免初始渲染就触发上层 save
    }

    getValue() {
        return this._serializeDomToText();
    }

    focus() {
        this.root.focus();
    }

    destroy() {
        // 主要解除文档级监听；元素事件随 DOM 移除自动释放
        // 当前实现没有 document 级监听需要手动清，因此 noop
    }

    /**
     * 在当前光标处插入一个徽章。如果光标前有 "@xxx" 待补全字符串（trigger 状态），
     * 会先把这段删掉，再插入徽章。
     *
     * 光标位置优先级：
     * 1. 如果有 _currentTriggerRange（键盘输入 @ 触发），用它（会替换 "@xxx" 段）
     * 2. 否则如果有 _savedRange（弹出 picker 时保存的最后焦点位置），恢复它
     * 3. 否则定位到编辑器末尾（兜底）
     */
    insertMention(type, id, asset) {
        if (!type || !id) return;
        // 先把焦点切回编辑器，否则后续 selection 操作不在编辑器里
        this.root.focus();

        // 决定起始 range
        const triggerRange = this._currentTriggerRange;
        if (triggerRange && this.root.contains(triggerRange.startContainer)) {
            // 用 trigger range：替换 "@xxx" 段
            this._snapshot();
            triggerRange.deleteContents();
            // 把光标定位到刚删除处
            const r = document.createRange();
            r.setStart(triggerRange.startContainer, triggerRange.startOffset);
            r.collapse(true);
            this._restoreSelection(r);
            this._currentTriggerRange = null;
        } else if (this._savedRange && this.root.contains(this._savedRange.startContainer)) {
            // 用保存的 range（按钮路径或 picker 抢焦点后丢失 selection）
            this._snapshot();
            this._restoreSelection(this._savedRange);
        } else {
            this._snapshot();
            this._placeCaretAtEnd();
        }

        const chip = this._createBadgeElement(type, id, asset);
        const range = this._getRange();
        if (!range) return;

        // 防粘连：根据前后字符判断是否补空格
        const { needLeading, needTrailing } = this._checkSpacePadding(range);
        if (needLeading) {
            range.insertNode(document.createTextNode(' '));
            range.collapse(false);
        }
        range.insertNode(chip);
        range.setStartAfter(chip);
        range.collapse(true);
        if (needTrailing) {
            const sp = document.createTextNode(' ');
            range.insertNode(sp);
            range.setStartAfter(sp);
            range.collapse(true);
        }
        this._restoreSelection(range);
        this._fireInput();
    }

    /**
     * 在当前光标处插入纯文本（多行用 \n 表示），主要用于粘贴。
     * 同时解析其中的 @char:xxx 自动转徽章。
     */
    insertPlainText(text) {
        if (!text) return;
        this._snapshot();
        const range = this._getRange();
        if (!range) return;
        range.deleteContents();

        const fragments = this._textToNodes(text);
        const frag = document.createDocumentFragment();
        fragments.forEach(node => frag.appendChild(node));
        // 拿到 frag 最后一个节点用于光标定位
        const lastNode = frag.lastChild;
        range.insertNode(frag);
        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            this._restoreSelection(range);
        }
        this._fireInput();
    }

    // ---------- 内部：DOM 渲染与序列化 ----------

    _renderTextToDom(text, legacyRefImages) {
        // 清空并重建
        this.root.innerHTML = '';
        const nodes = this._textToNodes(text, { legacyRefImages });
        nodes.forEach(n => this.root.appendChild(n));
    }

    _textToNodes(text, options) {
        // 把字符串解析成 [textNode | <br> | chipSpan] 列表
        // 处理顺序：先扫描 @char:/@scene:，未命中且提供 legacyRefImages 时再扫 [图N]
        options = options || {};
        const legacyRefImages = options.legacyRefImages || [];
        const out = [];
        if (!text) return out;

        const hasModern = /@(?:char|scene):[A-Za-z0-9_\-]{1,64}/.test(text);
        const useLegacy = !hasModern && legacyRefImages.length > 0;

        // 我们把 mention、@提示词库 和 [图N] 当作"占位 token"切分原始字符串：
        // 用统一正则一次性切，避免双重处理。
        const promptTitles = promptLibrary
            .map(item => String(item.title || '').trim())
            .filter(Boolean)
            .sort((a, b) => b.length - a.length);
        const promptPart = promptTitles.length
            ? `|@(?<promptTitle>${promptTitles.map(escapeRegExp).join('|')})${PROMPT_MENTION_END_SOURCE}`
            : '';
        const legacyPart = useLegacy ? '|\\[图\\s*(?<legacyNum>\\d+)\\s*\\]' : '';
        const combinedRe = new RegExp(`@(?<kind>char|scene):(?<assetId>[A-Za-z0-9_\\-]{1,64})${legacyPart}${promptPart}`, 'gi');

        let lastIndex = 0;
        let m;
        while ((m = combinedRe.exec(text)) !== null) {
            const matchStart = m.index;
            const matchEnd = combinedRe.lastIndex;
            if (matchStart > lastIndex) {
                this._appendTextWithBreaks(out, text.slice(lastIndex, matchStart));
            }
            const groups = m.groups || {};
            if (groups.kind && groups.assetId) {
                // @char:xxx / @scene:xxx
                const kind = groups.kind.toLowerCase();
                const id = groups.assetId;
                const asset = lookupMentionAsset(kind, id);
                out.push(this._createBadgeElement(kind, id, asset));
            } else if (groups.promptTitle) {
                const title = groups.promptTitle;
                const item = promptLibrary.find(p => String(p.title || '').toLowerCase() === String(title || '').toLowerCase());
                if (item) out.push(this._createBadgeElement('prompt', item.id, item));
                else this._appendTextWithBreaks(out, m[0]);
            } else if (groups.legacyNum) {
                // 老 [图N]
                const num = parseInt(groups.legacyNum, 10);
                const idx = num - 1;
                if (idx >= 0 && idx < legacyRefImages.length) {
                    const refPath = legacyRefImages[idx];
                    const ch = characters.find(c => c.image_path === refPath);
                    const sc = !ch ? scenes.find(s => s.image_path === refPath) : null;
                    // 老 [图N] 显示为彩色徽章，但序列化时仍输出 [图N]，避免默默迁移用户数据
                    if (ch) out.push(this._createLegacyBadgeElement(num, ch, 'char'));
                    else if (sc) out.push(this._createLegacyBadgeElement(num, sc, 'scene'));
                    else out.push(this._createLegacyMissingBadge(num));
                } else {
                    // 越界保持原文
                    this._appendTextWithBreaks(out, m[0]);
                }
            }
            lastIndex = matchEnd;
        }
        if (lastIndex < text.length) {
            this._appendTextWithBreaks(out, text.slice(lastIndex));
        }
        return out;
    }

    _appendTextWithBreaks(arr, str) {
        const parts = str.split('\n');
        parts.forEach((part, i) => {
            if (part.length > 0) arr.push(document.createTextNode(part));
            if (i < parts.length - 1) arr.push(document.createElement('br'));
        });
    }

    _createBadgeElement(kind, id, asset) {
        const span = document.createElement('span');
        span.className = getMentionChipClass(kind, asset);
        span.setAttribute('contenteditable', 'false');
        span.dataset.mentionType = kind;
        span.dataset.mentionId = id;
        if (kind === 'prompt') {
            span.dataset.promptTitle = (asset && asset.title) || id;
        }
        span.textContent = getMentionDisplayLabel(kind, id, asset);
        const title = kind === 'prompt'
            ? (asset ? `提示词库 @${asset.title}\n${asset.content || ''}` : `找不到提示词 @${id}`)
            : (asset ? `${kind}:${id}` : `找不到素材 ${kind}:${id}`);
        span.title = title;
        return span;
    }

    _createLegacyBadgeElement(num, asset, displayKind) {
        // 老 [图N] 徽章：显示用 char/scene 配色和图标，但 mentionType='legacy'，
        // 序列化时输出原 [图N]，不强制迁移到新格式。
        const span = document.createElement('span');
        span.className = displayKind === 'scene' ? 'mention-chip mention-scene' : 'mention-chip mention-char';
        span.setAttribute('contenteditable', 'false');
        span.dataset.mentionType = 'legacy';
        span.dataset.mentionId = String(num);
        const prefix = displayKind === 'scene' ? '📍' : '👤';
        const name = (asset && asset.name) || `图${num}`;
        span.textContent = `${prefix} ${name}（[图${num}]）`;
        span.title = `老引用 [图${num}] → ${displayKind}:${asset && asset.id || ''}（保留原格式不迁移）`;
        return span;
    }

    _createLegacyMissingBadge(num) {
        const span = document.createElement('span');
        span.className = 'mention-chip mention-missing';
        span.setAttribute('contenteditable', 'false');
        span.dataset.mentionType = 'legacy';
        span.dataset.mentionId = String(num);
        span.textContent = `⚠ 老[图${num}]`;
        return span;
    }

    _serializeDomToText() {
        // 用 NodeIterator 顺序遍历 root 的所有 leaf 节点
        let out = '';
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                out += node.nodeValue;
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node;
            if (el.tagName === 'BR') {
                out += '\n';
                return;
            }
            if (el.dataset && el.dataset.mentionType && el.dataset.mentionId) {
                const t = el.dataset.mentionType;
                const id = el.dataset.mentionId;
                if (t === 'char' || t === 'scene') {
                    out += `@${t}:${id}`;
                } else if (t === 'prompt') {
                    const item = lookupMentionAsset('prompt', id);
                    out += `@${(item && item.title) || el.dataset.promptTitle || id}`;
                } else if (t === 'legacy') {
                    // 老 [图N] 徽章序列化回原文，保持兼容
                    out += `[图${id}]`;
                }
                return;
            }
            // div/p 之类的块元素也算换行（浏览器输入 Enter 时可能临时生成）
            const isBlock = el.tagName === 'DIV' || el.tagName === 'P';
            if (isBlock && out.length > 0 && !out.endsWith('\n')) {
                out += '\n';
            }
            for (let i = 0; i < el.childNodes.length; i++) {
                walk(el.childNodes[i]);
            }
        };
        for (let i = 0; i < this.root.childNodes.length; i++) {
            walk(this.root.childNodes[i]);
        }
        return out;
    }

    // ---------- 内部：事件绑定 ----------

    _bindEvents() {
        this.root.addEventListener('compositionstart', () => { this._isComposing = true; });
        this.root.addEventListener('compositionend', (evt) => {
            this._isComposing = false;
            // composition 结束后再做一次 input 处理（检测 @ 触发）
            this._handleInput(evt);
        });

        this.root.addEventListener('input', (evt) => {
            if (this._suppressInputEvent) return;
            // IME 期间不处理（input 事件在 composing 时仍会触发）
            if (this._isComposing) {
                this._fireInputSilent();
                return;
            }
            this._handleInput(evt);
        });

        this.root.addEventListener('keydown', (evt) => this._handleKeyDown(evt));
        this.root.addEventListener('keyup', (evt) => {
            if (evt.key === '@' && !this._isComposing) {
                this._detectMentionTrigger();
            }
        });
        this.root.addEventListener('paste', (evt) => this._handlePaste(evt));

        // 防御：拖拽 HTML 进来也强制纯文本
        this.root.addEventListener('drop', (evt) => {
            const dt = evt.dataTransfer;
            if (!dt) return;
            const text = dt.getData('text/plain') || dt.getData('text');
            if (text) {
                evt.preventDefault();
                this.focus();
                this.insertPlainText(text);
            }
        });

        // 失焦前保存当前 range，供 picker 选择后插入到正确位置（按钮触发路径关键）
        // 注意：picker 浮层抢走焦点时也会触发 blur，所以这里"无脑保存"，
        // insertMention 时优先用 _currentTriggerRange，否则用 _savedRange。
        this.root.addEventListener('blur', () => {
            this.saveCurrentRange();
        });
    }

    _handleInput(evt) {
        // 把临时被浏览器插入的 <div>/<p> 等块元素拍平（保持单层结构）
        this._flattenBlockChildren();
        // 检测 @ 触发
        this._detectMentionTrigger();
        // 节流地打 undo 快照
        this._scheduleSnapshot();
        this._fireInput();
    }

    _flattenBlockChildren() {
        // 把 <div> / <p> 转成换行（如果是 Enter 产生的）
        const blocks = this.root.querySelectorAll('div, p');
        blocks.forEach(block => {
            const parent = block.parentNode;
            if (!parent) return;
            const before = document.createElement('br');
            parent.insertBefore(before, block);
            while (block.firstChild) {
                parent.insertBefore(block.firstChild, block);
            }
            parent.removeChild(block);
        });
    }

    _detectMentionTrigger() {
        // 检查光标前是否有 "@" 字符触发 picker
        // 规则：光标前的连续非空白文本里以 @ 开头，且 @ 前面是字符串开头或边界字符
        const range = this._getRange();
        if (!range || !range.collapsed) {
            this._currentTriggerRange = null;
            this.options.onMentionTriggerClose?.();
            return;
        }
        const triggerInfo = this._findTriggerBefore(range);
        if (!triggerInfo) {
            this._currentTriggerRange = null;
            this.options.onMentionTriggerClose?.();
            return;
        }
        this._currentTriggerRange = triggerInfo.range;
        // 同时保存当前 caret 作为 _savedRange 兜底（picker 抢焦点后能恢复）
        this._savedRange = range.cloneRange();
        this.options.onMentionTrigger?.(triggerInfo.query, triggerInfo.anchorRect);
    }

    /**
     * 立即保存当前编辑器内 selection 范围，供 picker 弹出后恢复使用。
     * 调用方应在弹出浮层"之前"调用。
     */
    saveCurrentRange() {
        const range = this._getRange();
        if (range) {
            this._savedRange = range.cloneRange();
            return true;
        }
        return false;
    }

    _findTriggerBefore(range) {
        // 从当前 caret 向前扫描同一文本节点，找到最近的 '@'，
        // 检查 @ 前一个字符是不是边界（空格/换行/标点/中文字符/文本开头）
        let node = range.startContainer;
        let offset = range.startOffset;
        if (!node) return null;
        if (node.nodeType !== Node.TEXT_NODE) {
            const prev = node.nodeType === Node.ELEMENT_NODE && offset > 0 ? node.childNodes[offset - 1] : null;
            if (!prev || prev.nodeType !== Node.TEXT_NODE) return null;
            node = prev;
            offset = (node.nodeValue || '').length;
        }
        const text = node.nodeValue || '';
        // 在 offset 之前找最近的 @
        const before = text.slice(0, offset);
        const atIdx = before.lastIndexOf('@');
        if (atIdx < 0) return null;
        const query = before.slice(atIdx + 1);
        // query 里不能含空白
        if (/\s/.test(query)) return null;
        // 如果 query 已经匹配上 @char:xxx / @scene:xxx 完整结构，已不是 trigger（应已被序列化为徽章）
        if (/^(char|scene):[A-Za-z0-9_\-]{1,64}$/.test(query)) return null;
        // 查 @ 前一位
        if (atIdx > 0) {
            const prevChar = before[atIdx - 1];
            if (prevChar && !MENTION_BOUNDARY_RE.test(prevChar)) return null;
        }
        // 构造一个 range 表示 "@xxx" 的位置（用于后续替换）
        const triggerRange = document.createRange();
        triggerRange.setStart(node, atIdx);
        triggerRange.setEnd(node, offset);

        // 计算 anchor 坐标用于浮层定位
        const rect = triggerRange.getBoundingClientRect();
        return { range: triggerRange, query, anchorRect: rect };
    }

    _handleKeyDown(evt) {
        // Ctrl/Cmd + Z 撤销
        if ((evt.ctrlKey || evt.metaKey) && !evt.shiftKey && (evt.key === 'z' || evt.key === 'Z')) {
            evt.preventDefault();
            this._undo();
            return;
        }
        // Ctrl/Cmd + Shift + Z 或 Ctrl + Y 重做
        if (((evt.ctrlKey || evt.metaKey) && evt.shiftKey && (evt.key === 'z' || evt.key === 'Z'))
            || ((evt.ctrlKey || evt.metaKey) && (evt.key === 'y' || evt.key === 'Y'))) {
            evt.preventDefault();
            this._redo();
            return;
        }
        // Enter：阻止默认插 <div>，改为 <br> + 换行
        if (evt.key === 'Enter' && !evt.shiftKey && !this._isComposing) {
            evt.preventDefault();
            this._insertLineBreak();
            return;
        }
        // 徽章原子删除：Backspace
        if (evt.key === 'Backspace' && !this._isComposing) {
            const handled = this._tryDeleteAdjacentChip('backward');
            if (handled) {
                evt.preventDefault();
                return;
            }
        }
        if (evt.key === 'Delete' && !this._isComposing) {
            const handled = this._tryDeleteAdjacentChip('forward');
            if (handled) {
                evt.preventDefault();
                return;
            }
        }
        // 上下方向键穿过 picker：在 picker 打开时让 picker 处理
        if ((evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === 'Enter' || evt.key === 'Escape')
            && document.getElementById('mentionPickerLayer')) {
            // 由 picker 自己监听 keydown 处理，这里只阻止编辑器默认
            evt.preventDefault();
            // 转发给 picker 输入框
            const search = document.getElementById('mentionPickerSearch');
            if (search) {
                const ev = new KeyboardEvent('keydown', { key: evt.key, bubbles: true, cancelable: true });
                search.dispatchEvent(ev);
            }
        }
        // 某些 contenteditable 光标形态下，浏览器会把 caret 放在根元素子节点之间；
        // input 事件里的 selection 可能已经不够稳定，@ 键抬起后的微任务再检测一次。
        if (evt.key === '@' && !this._isComposing) {
            setTimeout(() => this._detectMentionTrigger(), 0);
        }
    }

    _insertLineBreak() {
        const range = this._getRange();
        if (!range) return;
        this._snapshot();
        range.deleteContents();
        const br = document.createElement('br');
        range.insertNode(br);
        // 如果换行后是末尾，浏览器需要一个尾随 br 才能让光标显示在新行
        if (!br.nextSibling) {
            const trailing = document.createElement('br');
            br.parentNode.insertBefore(trailing, br.nextSibling);
            range.setStartBefore(trailing);
        } else {
            range.setStartAfter(br);
        }
        range.collapse(true);
        this._restoreSelection(range);
        this._fireInput();
    }

    _tryDeleteAdjacentChip(direction) {
        // 仅当 caret 折叠（无选区）且紧邻一个徽章时，整体删掉徽章
        const range = this._getRange();
        if (!range || !range.collapsed) return false;
        const node = range.startContainer;
        const offset = range.startOffset;
        let chip = null;
        if (direction === 'backward') {
            // caret 在文本节点开头 → 看前一个兄弟
            if (node.nodeType === Node.TEXT_NODE && offset === 0) {
                const prev = node.previousSibling;
                if (this._isChipNode(prev)) chip = prev;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // caret 在元素子节点之间 → 看 offset-1 位置的子节点
                const prev = node.childNodes[offset - 1];
                if (this._isChipNode(prev)) chip = prev;
            }
        } else {
            if (node.nodeType === Node.TEXT_NODE && offset === (node.nodeValue || '').length) {
                const next = node.nextSibling;
                if (this._isChipNode(next)) chip = next;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const next = node.childNodes[offset];
                if (this._isChipNode(next)) chip = next;
            }
        }
        if (!chip) return false;
        this._snapshot();
        // 删除徽章后保持光标在它原位置
        const parent = chip.parentNode;
        const newRange = document.createRange();
        if (direction === 'backward') {
            const prev = chip.previousSibling;
            parent.removeChild(chip);
            if (prev) newRange.setStartAfter(prev);
            else newRange.setStart(parent, 0);
        } else {
            const next = chip.nextSibling;
            parent.removeChild(chip);
            if (next) newRange.setStartBefore(next);
            else newRange.setStart(parent, parent.childNodes.length);
        }
        newRange.collapse(true);
        this._restoreSelection(newRange);
        this._fireInput();
        return true;
    }

    _isChipNode(node) {
        return !!(node && node.nodeType === Node.ELEMENT_NODE && node.dataset && node.dataset.mentionId);
    }

    _handlePaste(evt) {
        evt.preventDefault();
        const cd = evt.clipboardData || window.clipboardData;
        const text = cd ? cd.getData('text/plain') : '';
        if (!text) return;
        this.insertPlainText(text);
    }

    // ---------- 内部：撤销栈 ----------

    _snapshot() {
        // 强制立即打快照（用于"原子操作"前）
        if (this._snapshotDebounce) {
            clearTimeout(this._snapshotDebounce);
            this._snapshotDebounce = null;
        }
        const cur = this.getValue();
        if (cur === this._lastSnapshot) return;
        this._undoStack.push(this._lastSnapshot);
        if (this._undoStack.length > 100) this._undoStack.shift();
        this._redoStack = [];
        this._lastSnapshot = cur;
    }

    _scheduleSnapshot() {
        // 节流快照：连续打字时只在停顿后打一次
        if (this._snapshotDebounce) clearTimeout(this._snapshotDebounce);
        this._snapshotDebounce = setTimeout(() => {
            this._snapshotDebounce = null;
            const cur = this.getValue();
            if (cur === this._lastSnapshot) return;
            this._undoStack.push(this._lastSnapshot);
            if (this._undoStack.length > 100) this._undoStack.shift();
            this._redoStack = [];
            this._lastSnapshot = cur;
        }, 500);
    }

    _undo() {
        if (this._snapshotDebounce) {
            clearTimeout(this._snapshotDebounce);
            this._snapshotDebounce = null;
            // 把当前停顿期的变更先快照
            const cur = this.getValue();
            if (cur !== this._lastSnapshot) {
                this._undoStack.push(this._lastSnapshot);
                this._lastSnapshot = cur;
            }
        }
        if (!this._undoStack.length) return;
        const prev = this._undoStack.pop();
        this._redoStack.push(this._lastSnapshot);
        this._lastSnapshot = prev;
        this._renderTextToDom(prev, []);
        this._placeCaretAtEnd();
        this._fireInput();
    }

    _redo() {
        if (!this._redoStack.length) return;
        const next = this._redoStack.pop();
        this._undoStack.push(this._lastSnapshot);
        this._lastSnapshot = next;
        this._renderTextToDom(next, []);
        this._placeCaretAtEnd();
        this._fireInput();
    }

    // ---------- 内部：Selection / Range 辅助 ----------

    _getRange() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        if (!this.root.contains(range.startContainer)) return null;
        return range;
    }

    _restoreSelection(range) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    _placeCaretAtEnd() {
        this.root.focus();
        const range = document.createRange();
        range.selectNodeContents(this.root);
        range.collapse(false);
        this._restoreSelection(range);
    }

    _checkSpacePadding(range) {
        // 判断 range.startContainer / startOffset 前后字符是否需要补空格
        let leadingChar = '';
        let trailingChar = '';
        const node = range.startContainer;
        const offset = range.startOffset;
        if (node.nodeType === Node.TEXT_NODE) {
            leadingChar = (node.nodeValue || '')[offset - 1] || '';
            trailingChar = (node.nodeValue || '')[offset] || '';
        }
        // 边界字符或空 → 不需要补空格
        const needLeading = !!leadingChar && !MENTION_BOUNDARY_RE.test(leadingChar);
        const needTrailing = !!trailingChar && !MENTION_BOUNDARY_RE.test(trailingChar);
        return { needLeading, needTrailing };
    }

    // ---------- 内部：事件 fire ----------

    _fireInput() {
        // 触发上层 onInput；对外保持 Event 结构相似
        try {
            this.options.onInput?.(this);
        } catch (e) {
            console.error('[MentionEditor] onInput callback error:', e);
        }
        // 同时发自定义 DOM 事件，方便老代码用 addEventListener('input', ...)
        this.root.dispatchEvent(new CustomEvent('mention-input', { bubbles: true }));
    }

    _fireInputSilent() {
        // IME 期间也通知上层，方便实时显示输入字符，但不做 @ 触发检测
        try {
            this.options.onInput?.(this);
        } catch (e) { /* noop */ }
    }
}

/**
 * 把一个 contenteditable div 包装成 MentionEditor 实例。
 * 实例挂在 element._mentionEditor 上方便随时取用。
 */
function attachMentionEditor(rootEl, options) {
    if (!rootEl) return null;
    if (rootEl._mentionEditor) return rootEl._mentionEditor;
    const editor = new MentionEditor(rootEl, options);
    rootEl._mentionEditor = editor;
    return editor;
}

/**
 * 工具函数：从一个 segEditor- 元素读出值（兼容历史 textarea 残留场景）。
 */
function readMentionEditorValue(el) {
    if (!el) return '';
    if (el._mentionEditor) return el._mentionEditor.getValue();
    // 兜底：万一某场景还残留 textarea
    if ('value' in el) return el.value || '';
    return el.textContent || '';
}

function writeMentionEditorValue(el, text) {
    if (!el) return;
    if (el._mentionEditor) {
        el._mentionEditor.setValue(text);
        return;
    }
    if ('value' in el) { el.value = text; return; }
    el.textContent = text;
}

// ==================== Mention Picker 选择浮层 ====================
//
// 浮层既被 MentionEditor 在用户输入 @ 时触发，也被 "插入素材" 按钮触发。

let _mentionPickerCtx = null;  // { editor, kind: 'editor'|'button', position: {x,y}|null }

function openMentionPickerForEditor(editor, anchorRect) {
    closeMentionPicker();
    const options = getMentionAssetOptions();
    if (!options.length) {
        showToast('暂无可用素材或提示词，请先在素材库/提示词库创建内容', 'warning');
        return;
    }
    _mentionPickerCtx = { editor, kind: 'editor' };
    const layer = _buildMentionPickerLayer(options, (type, id, asset) => {
        editor.insertMention(type, id, asset);
        closeMentionPicker();
    });
    _positionPickerLayer(layer, anchorRect || editor.root.getBoundingClientRect());
}

function openMentionPickerForButton(index) {
    const root = document.getElementById(`segEditor-${index}`);
    const editor = root?._mentionEditor;
    if (!editor) {
        showToast('编辑器未就绪', 'warning');
        return;
    }
    editor.focus();
    closeMentionPicker();
    const options = getMentionAssetOptions();
    if (!options.length) {
        showToast('暂无可用素材或提示词，请先在素材库/提示词库创建内容', 'warning');
        return;
    }
    _mentionPickerCtx = { editor, kind: 'button' };
    const layer = _buildMentionPickerLayer(options, (type, id, asset) => {
        editor.insertMention(type, id, asset);
        closeMentionPicker();
    });
    _positionPickerLayer(layer, root.getBoundingClientRect());
}

function openMentionPickerForReprocess(index) {
    const root = document.getElementById(`segmentReprocessInstruction-${index}`);
    const editor = root?._mentionEditor;
    if (!editor) {
        showToast('二次处理输入框未就绪', 'warning');
        return;
    }
    editor.focus();
    closeMentionPicker();
    const options = getMentionAssetOptions();
    if (!options.length) {
        showToast('暂无可用素材或提示词，请先在素材库/提示词库创建内容', 'warning');
        return;
    }
    _mentionPickerCtx = { editor, kind: 'button' };
    const layer = _buildMentionPickerLayer(options, (type, id, asset) => {
        editor.insertMention(type, id, asset);
        closeMentionPicker();
    });
    _positionPickerLayer(layer, root.getBoundingClientRect());
}

/**
 * 视频编辑模式的 "@ 插入素材" 按钮入口。
 * 与 openMentionPickerForButton 行为一致，但用固定的 videoEditorPrompt 容器 ID。
 */
function openMentionPickerForVideoEditor() {
    const root = document.getElementById('videoEditorPrompt');
    let editor = root?._mentionEditor;
    if (!editor) {
        // 兜底：如果还没初始化（极端情况），现场挂一个
        ensureVideoEditorMentionEditor();
        editor = root?._mentionEditor;
    }
    if (!editor) {
        showToast('编辑器未就绪', 'warning');
        return;
    }
    editor.focus();
    closeMentionPicker();
    const options = getMentionAssetOptions();
    if (!options.length) {
        showToast('暂无可用素材或提示词，请先在素材库/提示词库创建内容', 'warning');
        return;
    }
    _mentionPickerCtx = { editor, kind: 'button' };
    const layer = _buildMentionPickerLayer(options, (type, id, asset) => {
        editor.insertMention(type, id, asset);
        closeMentionPicker();
    });
    _positionPickerLayer(layer, root.getBoundingClientRect());
}

/**
 * 视频编辑模式的 MentionEditor 初始化。
 * 在用户首次切换到视频编辑标签页时调用（refreshVideoEditorPreview 已接入）。
 * 重复调用安全：attachMentionEditor 内部判断 _mentionEditor 已存在则直接返回。
 */
function ensureVideoEditorMentionEditor() {
    const root = document.getElementById('videoEditorPrompt');
    if (!root) return null;
    if (root._mentionEditor) return root._mentionEditor;
    const rows = parseInt(root.dataset.rows || '6', 10);
    root.style.minHeight = `${Math.max(rows, 6) * 1.6}em`;
    const editor = attachMentionEditor(root, {
        placeholder: root.dataset.placeholder || '',
        onMentionTrigger: (query, anchorRect) => {
            openMentionPickerForEditor(editor, anchorRect);
            const search = document.getElementById('mentionPickerSearch');
            if (search) {
                search.value = query || '';
                search.dispatchEvent(new Event('input', { bubbles: true }));
            }
        },
        onMentionTriggerClose: () => {
            if (_mentionPickerCtx && _mentionPickerCtx.kind === 'editor') {
                closeMentionPicker();
            }
        },
    });
    // 初始内容为空字符串；后续用户输入由 contenteditable 自然处理
    editor.setValue('');
    return editor;
}

function _buildMentionPickerLayer(options, onPick) {
    const layer = document.createElement('div');
    layer.className = 'mention-picker';
    layer.id = 'mentionPickerLayer';
    layer.innerHTML = `
        <div class="mention-picker-header">
            <input type="text" id="mentionPickerSearch" placeholder="搜索素材或提示词..." />
            <button type="button" class="mention-picker-close" title="关闭" aria-label="关闭">✕</button>
        </div>
        <div class="mention-picker-list" id="mentionPickerList">
            ${options.map((opt, optIdx) => `
                <div class="mention-picker-item" data-idx="${optIdx}" data-type="${opt.type}" data-id="${escAttr(opt.id)}" data-search="${escAttr(opt.searchText || `${opt.label || ''} ${opt.type}:${opt.id}`)}">
                    ${opt.image_path ? `<img src="/${escAttr(opt.image_path)}" alt="">` : '<span class="mention-picker-placeholder"></span>'}
                    <span class="mention-picker-label">${escHtml(opt.label)}</span>
                    <span class="mention-picker-id">${escHtml(opt.meta || (opt.type + ':' + opt.id))}</span>
                </div>
            `).join('')}
        </div>
    `;
    document.body.appendChild(layer);
    const searchInput = layer.querySelector('#mentionPickerSearch');
    const list = layer.querySelector('#mentionPickerList');

    searchInput.addEventListener('input', () => {
        const kw = searchInput.value.trim().toLowerCase();
        list.querySelectorAll('.mention-picker-item').forEach(item => {
            const labelText = item.querySelector('.mention-picker-label')?.textContent?.toLowerCase() || '';
            const idText = item.querySelector('.mention-picker-id')?.textContent?.toLowerCase() || '';
            const searchText = item.dataset.search?.toLowerCase() || '';
            item.style.display = (!kw || labelText.includes(kw) || idText.includes(kw) || searchText.includes(kw)) ? '' : 'none';
        });
        activeIdx = 0;
        updateActive();
    });

    list.addEventListener('mousedown', (evt) => {
        // 用 mousedown 而不是 click：避免 editor 失焦
        evt.preventDefault();
        const item = evt.target.closest('.mention-picker-item');
        if (!item) return;
        const type = item.dataset.type;
        const id = item.dataset.id;
        const asset = lookupMentionAsset(type, id);
        onPick(type, id, asset);
    });

    let activeIdx = 0;
    const updateActive = () => {
        const items = Array.from(list.querySelectorAll('.mention-picker-item')).filter(el => el.style.display !== 'none');
        items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
        if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    };
    updateActive();

    const keyHandler = (evt) => {
        const items = Array.from(list.querySelectorAll('.mention-picker-item')).filter(el => el.style.display !== 'none');
        if (!items.length) return;
        if (evt.key === 'ArrowDown') { evt.preventDefault(); activeIdx = (activeIdx + 1) % items.length; updateActive(); }
        else if (evt.key === 'ArrowUp') { evt.preventDefault(); activeIdx = (activeIdx - 1 + items.length) % items.length; updateActive(); }
        else if (evt.key === 'Enter') {
            evt.preventDefault();
            const item = items[activeIdx];
            if (item) {
                const type = item.dataset.type;
                const id = item.dataset.id;
                const asset = lookupMentionAsset(type, id);
                onPick(type, id, asset);
            }
        } else if (evt.key === 'Escape') { evt.preventDefault(); closeMentionPicker(); }
    };
    searchInput.addEventListener('keydown', keyHandler);
    layer._keyHandler = keyHandler;  // 保存引用，editor 触发时可外部转发

    layer.querySelector('.mention-picker-close').addEventListener('mousedown', (e) => {
        e.preventDefault();
        closeMentionPicker();
    });

    setTimeout(() => searchInput.focus(), 30);
    setTimeout(() => {
        document.addEventListener('mousedown', mentionPickerOutsideHandler, { capture: true });
    }, 0);
    return layer;
}

function _positionPickerLayer(layer, anchorRect) {
    layer.style.position = 'fixed';
    const width = Math.max(280, Math.min(480, anchorRect.width));
    layer.style.width = `${width}px`;
    let left = Math.max(8, anchorRect.left);
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
    let top = anchorRect.bottom + 4;
    if (top + 320 > window.innerHeight - 8) top = Math.max(8, anchorRect.top - 320 - 4);
    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
}

function mentionPickerOutsideHandler(evt) {
    const layer = document.getElementById('mentionPickerLayer');
    if (!layer) {
        document.removeEventListener('mousedown', mentionPickerOutsideHandler, { capture: true });
        return;
    }
    // 点击在 picker 内 / editor 内都不关闭（编辑过程中也允许）
    if (layer.contains(evt.target)) return;
    const editor = _mentionPickerCtx?.editor;
    if (editor && editor.root.contains(evt.target)) return;
    closeMentionPicker();
}

function closeMentionPicker() {
    const layer = document.getElementById('mentionPickerLayer');
    if (layer) layer.remove();
    _mentionPickerCtx = null;
    document.removeEventListener('mousedown', mentionPickerOutsideHandler, { capture: true });
}
