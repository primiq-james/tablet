from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt, Signal, QSize
from PySide6.QtGui import QDesktopServices, QPixmap
from PySide6.QtWidgets import (
    QApplication,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QPlainTextEdit,
    QScrollArea,
    QSplitter,
    QTextBrowser,
    QToolButton,
    QTreeWidget,
    QTreeWidgetItem,
    QVBoxLayout,
    QWidget,
    QFileDialog,
    QInputDialog,
)
from PySide6.QtCore import QUrl

from native_app.storage import Storage
VISUAL_EXTENSIONS = {".svg", ".png", ".jpg", ".jpeg", ".webp"}


def _is_visual_reference(path: str) -> bool:
    return Path(path).suffix.lower() in VISUAL_EXTENSIONS


class ReferenceChip(QToolButton):
    clicked_path = Signal(str)

    def __init__(self, path: str, title: str, parent=None) -> None:
        super().__init__(parent)
        self.path = path
        self.setText(title)
        self.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextOnly)
        self.clicked.connect(lambda: self.clicked_path.emit(self.path))
        self.setCursor(Qt.CursorShape.PointingHandCursor)


class ImageReferenceCard(QFrame):
    clicked_path = Signal(str)

    def __init__(self, reference: dict, parent=None) -> None:
        super().__init__(parent)
        self.reference = reference
        self.setObjectName("imageReferenceCard")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        preview = QTextBrowser()
        preview.setObjectName("imagePreview")
        preview.setOpenLinks(False)
        preview.setOpenExternalLinks(False)
        preview.setFrameShape(QFrame.Shape.NoFrame)
        preview.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        preview.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        preview.setMaximumHeight(220)
        preview.setHtml(
            f"""
            <div style="background:#101519;border-radius:14px;overflow:hidden;">
              <img src="{QUrl.fromLocalFile(reference['path']).toString()}" width="320" />
            </div>
            """
        )
        preview.anchorClicked.connect(lambda _url: self.clicked_path.emit(self.reference["path"]))
        preview.mousePressEvent = lambda _event: self.clicked_path.emit(self.reference["path"])

        title = QLabel(reference["title"])
        title.setObjectName("imageCardTitle")
        meta = QLabel(f"{reference['category']} · {reference['extension']}")
        meta.setObjectName("imageCardMeta")

        open_button = QPushButton("Open Visual")
        open_button.clicked.connect(lambda: self.clicked_path.emit(self.reference["path"]))

        layout.addWidget(preview)
        layout.addWidget(title)
        layout.addWidget(meta)
        layout.addWidget(open_button, 0, Qt.AlignmentFlag.AlignLeft)


class MessageBubble(QFrame):
    reference_clicked = Signal(str)

    def __init__(self, role: str, content: str, references: list[dict], parent=None) -> None:
        super().__init__(parent)
        self.setObjectName(f"{role}Bubble")
        layout = QVBoxLayout(self)
        role_label = QLabel("You" if role == "user" else "Assistant")
        role_label.setObjectName("roleLabel")
        layout.addWidget(role_label)

        text = QTextBrowser()
        text.setOpenExternalLinks(False)
        text.setFrameShape(QFrame.Shape.NoFrame)
        text.setMarkdown(content)
        text.setMinimumHeight(72)
        layout.addWidget(text)

        if references:
            visual_refs = [reference for reference in references if _is_visual_reference(reference["path"])]
            for reference in visual_refs[:2]:
                card = ImageReferenceCard(reference)
                card.clicked_path.connect(self.reference_clicked.emit)
                layout.addWidget(card)

            refs_row = QHBoxLayout()
            refs_row.setSpacing(8)
            for reference in references:
                chip = ReferenceChip(reference["path"], Path(reference["path"]).stem.replace("-", " ").title())
                chip.setObjectName("referenceChip")
                chip.clicked_path.connect(self.reference_clicked.emit)
                refs_row.addWidget(chip)
            refs_row.addStretch(1)
            layout.addLayout(refs_row)


class MainWindow(QMainWindow):
    def __init__(self, storage: Storage) -> None:
        super().__init__()
        self.storage = storage
        self.current_chat_id: int | None = None
        self.pending_references: list[str] = []
        self.logo_path = Path(__file__).resolve().parent.parent / "assets" / "blackgrid-logo.png"
        self.sidebar_collapsed = False
        self.theme = self.storage.get_setting("theme", "dark") or "dark"

        self.setWindowTitle("Circuit Tablet Native")
        self.resize(1440, 960)
        self.setMinimumSize(QSize(1180, 760))

        self._build_ui()
        self._populate_document_tree()
        self._populate_chat_list()
        self._apply_settings()

    def _build_ui(self) -> None:
        root = QWidget()
        self.setCentralWidget(root)
        root_layout = QVBoxLayout(root)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(8)

        self.top_bar = self._build_top_bar()
        root_layout.addWidget(self.top_bar)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setChildrenCollapsible(False)
        root_layout.addWidget(splitter, 1)

        self.sidebar = self._build_sidebar()
        splitter.addWidget(self.sidebar)

        self.chat_panel = self._build_chat_panel()
        splitter.addWidget(self.chat_panel)

        self.main_splitter = splitter
        splitter.setSizes([320, 1120])

    def _build_top_bar(self) -> QWidget:
        wrapper = QFrame()
        wrapper.setObjectName("topBar")
        layout = QHBoxLayout(wrapper)
        layout.setContentsMargins(18, 8, 18, 8)
        layout.setSpacing(12)

        logo_label = QLabel()
        logo_label.setObjectName("topLogo")
        pixmap = QPixmap(str(self.logo_path))
        if not pixmap.isNull():
            logo_label.setPixmap(
                pixmap.scaled(320, 64, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
            )
        layout.addWidget(logo_label, 0, Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignVCenter)
        layout.addStretch(1)

        self.theme_button = QPushButton()
        self.theme_button.setObjectName("themeButton")
        self.theme_button.clicked.connect(self._toggle_theme)
        layout.addWidget(self.theme_button)
        return wrapper

    def _build_sidebar(self) -> QWidget:
        wrapper = QFrame()
        wrapper.setObjectName("sidebar")
        layout = QVBoxLayout(wrapper)
        layout.setContentsMargins(14, 14, 14, 14)
        layout.setSpacing(10)

        new_chat = QPushButton("New Chat")
        new_chat.clicked.connect(self._new_chat)
        new_chat.setObjectName("primaryButton")
        layout.addWidget(new_chat)

        self.chat_search = QLineEdit()
        self.chat_search.setPlaceholderText("Search chats")
        self.chat_search.textChanged.connect(self._populate_chat_list)
        layout.addWidget(self.chat_search)

        self.chat_list = QListWidget()
        self.chat_list.itemClicked.connect(self._on_chat_selected)
        self.chat_list.setObjectName("chatList")
        layout.addWidget(self.chat_list, 2)

        self.docs_panel = QFrame()
        self.docs_panel.setObjectName("docsPanel")
        docs_layout = QVBoxLayout(self.docs_panel)
        docs_layout.setContentsMargins(0, 0, 0, 0)
        docs_layout.setSpacing(10)

        docs_title = QLabel("Documents")
        docs_title.setObjectName("sectionTitle")
        docs_layout.addWidget(docs_title)
        self.document_tree = QTreeWidget()
        self.document_tree.setHeaderHidden(True)
        self.document_tree.itemClicked.connect(self._on_document_tree_clicked)
        self.document_tree.setObjectName("documentTree")
        docs_layout.addWidget(self.document_tree, 1)
        self.docs_panel.hide()
        layout.addWidget(self.docs_panel, 1)

        desktop_row = QHBoxLayout()
        desktop_button = QPushButton("Desktop")
        desktop_button.clicked.connect(self._show_desktop)
        desktop_row.addWidget(desktop_button)

        home_button = QPushButton("Folder")
        home_button.clicked.connect(self._open_home_folder)
        desktop_row.addWidget(home_button)
        desktop_row.setStretch(0, 1)
        desktop_row.setStretch(1, 1)
        layout.addLayout(desktop_row)

        return wrapper

    def _build_chat_panel(self) -> QWidget:
        wrapper = QFrame()
        wrapper.setObjectName("chatPanel")
        layout = QVBoxLayout(wrapper)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(12)

        panel_header = QHBoxLayout()
        panel_title_row = QHBoxLayout()
        title_badge = QLabel("◌")
        title_badge.setObjectName("chatBadge")
        panel_title_row.addWidget(title_badge)

        panel_title = QLabel("Chat")
        panel_title.setObjectName("panelTitle")
        panel_title_row.addWidget(panel_title)
        panel_title_row.addStretch(1)
        panel_header.addLayout(panel_title_row, 1)

        self.docs_toggle_button = QPushButton("🗂")
        self.docs_toggle_button.setToolTip("Show documents")
        self.docs_toggle_button.clicked.connect(self._toggle_documents)
        self.docs_toggle_button.setObjectName("iconButton")
        panel_header.addWidget(self.docs_toggle_button)

        self.desktop_button = QPushButton("⌂")
        self.desktop_button.setToolTip("Show Pi Desktop")
        self.desktop_button.clicked.connect(self._show_desktop)
        self.desktop_button.setObjectName("iconButton")
        panel_header.addWidget(self.desktop_button)

        self.reindex_button = QPushButton("⟳")
        self.reindex_button.setToolTip("Reindex local documents")
        self.reindex_button.clicked.connect(self._reindex_documents)
        self.reindex_button.setObjectName("iconButton")
        panel_header.addWidget(self.reindex_button)

        self.fullscreen_button = QPushButton("⛶")
        self.fullscreen_button.setToolTip("Toggle fullscreen")
        self.fullscreen_button.clicked.connect(self._toggle_fullscreen)
        self.fullscreen_button.setObjectName("iconButton")
        panel_header.addWidget(self.fullscreen_button)

        self.sidebar_toggle_button = QPushButton("☰")
        self.sidebar_toggle_button.setToolTip("Collapse chat history")
        self.sidebar_toggle_button.clicked.connect(self._toggle_sidebar)
        self.sidebar_toggle_button.setObjectName("iconButton")
        panel_header.addWidget(self.sidebar_toggle_button)
        layout.addLayout(panel_header)

        header = QHBoxLayout()
        self.chat_title = QLabel("New session")
        self.chat_title.setObjectName("chatTitle")
        header.addWidget(self.chat_title)
        header.addStretch(1)
        self.rename_chat_button = QPushButton("✎")
        self.rename_chat_button.setToolTip("Rename chat")
        self.rename_chat_button.clicked.connect(self._rename_chat)
        self.rename_chat_button.setObjectName("iconButton")
        self.delete_chat_button = QPushButton("🗑")
        self.delete_chat_button.setToolTip("Delete chat")
        self.delete_chat_button.clicked.connect(self._delete_chat)
        self.delete_chat_button.setObjectName("iconButton")
        header.addWidget(self.rename_chat_button)
        header.addWidget(self.delete_chat_button)
        layout.addLayout(header)

        quick_row = QHBoxLayout()
        for label in ("Docs", "PDFs", "Maps", "Folder"):
            button = QPushButton(label)
            button.clicked.connect(lambda _checked=False, value=label: self._handle_quick_action(value))
            quick_row.addWidget(button)
        layout.addLayout(quick_row)

        self.chat_scroll = QScrollArea()
        self.chat_scroll.setWidgetResizable(True)
        self.chat_container = QWidget()
        self.chat_messages_layout = QVBoxLayout(self.chat_container)
        self.chat_messages_layout.setSpacing(14)
        self.empty_state = self._build_empty_state()
        self.chat_messages_layout.addWidget(self.empty_state)
        self.chat_messages_layout.addStretch(1)
        self.chat_scroll.setWidget(self.chat_container)
        layout.addWidget(self.chat_scroll, 1)

        self.pending_refs_label = QLabel("No attached references")
        self.pending_refs_label.setObjectName("pendingRefs")
        layout.addWidget(self.pending_refs_label)

        composer_row = QHBoxLayout()

        self.composer = QPlainTextEdit()
        self.composer.setPlaceholderText("Ask about manuals, maps, farming, circuits, shelter plans, or photos...")
        self.composer.setFixedHeight(92)
        composer_row.addWidget(self.composer, 1)

        self.attach_button = QPushButton("＋")
        self.attach_button.setToolTip("Attach file")
        self.attach_button.clicked.connect(self._attach_file)
        self.attach_button.setObjectName("composerIconButton")
        composer_row.addWidget(self.attach_button)

        self.mic_button = QPushButton("🎤")
        self.mic_button.setToolTip("Microphone")
        self.mic_button.setObjectName("composerIconButton")
        composer_row.addWidget(self.mic_button)

        self.send_button = QPushButton("➜")
        self.send_button.setToolTip("Send")
        self.send_button.setObjectName("sendButton")
        self.send_button.clicked.connect(self._send_message)
        composer_row.addWidget(self.send_button)
        layout.addLayout(composer_row)

        return wrapper

    def _apply_settings(self) -> None:
        self.theme_button.setText("☀ Light" if self.theme == "dark" else "🌙 Dark")
        self.setStyleSheet(self._dark_stylesheet() if self.theme == "dark" else self._light_stylesheet())

    def _dark_stylesheet(self) -> str:
        return """
            QWidget {
                background-color: #0a0a0b;
                color: #f2f2f3;
                font-family: "Inter", "Segoe UI", sans-serif;
                font-size: 16px;
            }
            QMainWindow::separator {
                background: #2d2d31;
                width: 1px;
                height: 1px;
            }
            #topBar, #sidebar, #chatPanel, #docsPanel, #emptyState {
                background: #141416;
                border: 1px solid #252529;
                border-radius: 18px;
            }
            #topBar {
                margin: 0;
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
            }
            #sidebarSubtitle, #pendingRefs, #roleLabel, #emptyStateSubtitle {
                color: #9a9aa1;
            }
            #sectionTitle, #panelTitle, #chatTitle {
                font-size: 19px;
                font-weight: 700;
            }
            #topLogo {
                min-height: 64px;
            }
            QPushButton {
                min-height: 40px;
                padding: 0 12px;
                border-radius: 12px;
                background: #212126;
                border: 1px solid #323238;
            }
            QPushButton:hover {
                background: #2b2b31;
            }
            #primaryButton {
                background: #d8d8dc;
                border: 1px solid #f1f1f2;
                color: #0f0f10;
                font-weight: 700;
            }
            #iconButton {
                min-width: 44px;
                max-width: 44px;
                min-height: 44px;
                padding: 0;
                font-size: 18px;
                border-radius: 14px;
            }
            #composerIconButton {
                min-width: 46px;
                max-width: 46px;
                min-height: 46px;
                padding: 0;
                font-size: 18px;
                border-radius: 23px;
            }
            #sendButton {
                min-width: 50px;
                max-width: 50px;
                min-height: 50px;
                padding: 0;
                font-size: 22px;
                border-radius: 25px;
                background: #d8d8dc;
                border: 1px solid #f1f1f2;
                color: #0f0f10;
                font-weight: 700;
            }
            #chatBadge {
                color: #d7d7dc;
                font-size: 24px;
                font-weight: 700;
                padding-right: 4px;
            }
            QLineEdit, QPlainTextEdit, QTextBrowser, QListWidget, QTreeWidget {
                background: #111113;
                border: 1px solid #26262b;
                border-radius: 14px;
                padding: 10px;
            }
            QPlainTextEdit {
                padding: 14px;
                font-size: 17px;
            }
            QListWidget::item, QTreeWidget::item {
                padding: 10px;
                margin: 2px 0;
                border-radius: 10px;
            }
            QListWidget::item:selected, QTreeWidget::item:selected {
                background: #2e2e34;
            }
            #userBubble {
                background: #252529;
                border-radius: 18px;
                padding: 14px;
                border: 1px solid #38383e;
            }
            #assistantBubble {
                background: #19191c;
                border-radius: 18px;
                padding: 14px;
                border: 1px solid #2c2c31;
            }
            #referenceChip {
                background: #232328;
                border: 1px solid #34343a;
                color: #e6e6e9;
                border-radius: 12px;
                padding: 8px 12px;
            }
            #imageReferenceCard {
                background: #1b1b1f;
                border: 1px solid #2d2d33;
                border-radius: 16px;
            }
            #imagePreview, #previewMedia {
                background: #0d0d0f;
                border-radius: 14px;
                padding: 0;
            }
            #imageCardTitle {
                font-size: 17px;
                font-weight: 700;
            }
            #imageCardMeta {
                color: #9b9ba1;
            }
            #chatList {
                outline: none;
            }
        """

    def _light_stylesheet(self) -> str:
        return """
            QWidget {
                background-color: #f4f4f6;
                color: #1b1b1f;
                font-family: "Inter", "Segoe UI", sans-serif;
                font-size: 16px;
            }
            QMainWindow::separator {
                background: #d7d7dd;
                width: 1px;
                height: 1px;
            }
            #topBar, #sidebar, #chatPanel, #docsPanel, #emptyState {
                background: #ffffff;
                border: 1px solid #dadade;
                border-radius: 18px;
            }
            #topBar {
                margin: 0;
                border-radius: 0;
                border-left: none;
                border-right: none;
                border-top: none;
            }
            #sidebarSubtitle, #pendingRefs, #roleLabel, #emptyStateSubtitle {
                color: #666875;
            }
            #sectionTitle, #panelTitle, #chatTitle {
                font-size: 19px;
                font-weight: 700;
            }
            #topLogo {
                min-height: 64px;
            }
            QPushButton {
                min-height: 40px;
                padding: 0 12px;
                border-radius: 12px;
                background: #f0f0f3;
                border: 1px solid #d3d3d8;
                color: #17171a;
            }
            QPushButton:hover {
                background: #e8e8ec;
            }
            #primaryButton {
                background: #1f1f24;
                border: 1px solid #303038;
                color: #fafafd;
                font-weight: 700;
            }
            #iconButton {
                min-width: 44px;
                max-width: 44px;
                min-height: 44px;
                padding: 0;
                font-size: 18px;
                border-radius: 14px;
            }
            #composerIconButton {
                min-width: 46px;
                max-width: 46px;
                min-height: 46px;
                padding: 0;
                font-size: 18px;
                border-radius: 23px;
            }
            #sendButton {
                min-width: 50px;
                max-width: 50px;
                min-height: 50px;
                padding: 0;
                font-size: 22px;
                border-radius: 25px;
                background: #1f1f24;
                border: 1px solid #303038;
                color: #fafafd;
                font-weight: 700;
            }
            #chatBadge {
                color: #6b6b73;
                font-size: 24px;
                font-weight: 700;
                padding-right: 4px;
            }
            QLineEdit, QPlainTextEdit, QTextBrowser, QListWidget, QTreeWidget {
                background: #fbfbfc;
                border: 1px solid #d8d8dd;
                border-radius: 14px;
                padding: 10px;
                color: #1b1b1f;
            }
            QPlainTextEdit {
                padding: 14px;
                font-size: 17px;
            }
            QListWidget::item, QTreeWidget::item {
                padding: 10px;
                margin: 2px 0;
                border-radius: 10px;
            }
            QListWidget::item:selected, QTreeWidget::item:selected {
                background: #ececf1;
            }
            #userBubble {
                background: #efeff3;
                border-radius: 18px;
                padding: 14px;
                border: 1px solid #dadade;
            }
            #assistantBubble {
                background: #ffffff;
                border-radius: 18px;
                padding: 14px;
                border: 1px solid #dbdbe0;
            }
            #referenceChip {
                background: #f1f1f4;
                border: 1px solid #d7d7dd;
                color: #202025;
                border-radius: 12px;
                padding: 8px 12px;
            }
            #imageReferenceCard {
                background: #f8f8fa;
                border: 1px solid #d9d9de;
                border-radius: 16px;
            }
            #imagePreview, #previewMedia {
                background: #ececef;
                border-radius: 14px;
                padding: 0;
            }
            #imageCardTitle {
                font-size: 17px;
                font-weight: 700;
            }
            #imageCardMeta {
                color: #666875;
            }
            #chatList {
                outline: none;
            }
        """

    def _build_empty_state(self) -> QWidget:
        wrapper = QFrame()
        wrapper.setObjectName("emptyState")
        layout = QVBoxLayout(wrapper)
        layout.setContentsMargins(40, 80, 40, 80)
        layout.setSpacing(14)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("Offline local intelligence for maps, manuals, circuits, shelter plans, farming, and photos.")
        subtitle.setObjectName("emptyStateSubtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setWordWrap(True)
        layout.addWidget(subtitle)
        return wrapper

    def _populate_chat_list(self) -> None:
        query = self.chat_search.text().strip()
        chats = self.storage.list_chats(query)
        self.chat_list.clear()
        for chat in chats:
            preview = chat["preview"][:56] + ("..." if len(chat["preview"]) > 56 else "")
            item = QListWidgetItem(f"{chat['title']}\n{preview or 'No messages yet'}")
            item.setData(Qt.ItemDataRole.UserRole, chat["id"])
            self.chat_list.addItem(item)

        if self.chat_list.count() and self.current_chat_id is None:
            self.chat_list.setCurrentRow(0)
            self._on_chat_selected(self.chat_list.item(0))

    def _populate_document_tree(self) -> None:
        self.document_tree.clear()
        grouped = self.storage.documents_by_category()
        for category, documents in grouped.items():
            category_item = QTreeWidgetItem([category])
            category_item.setData(0, Qt.ItemDataRole.UserRole, None)
            for document in documents:
                doc_item = QTreeWidgetItem([document["title"]])
                doc_item.setData(0, Qt.ItemDataRole.UserRole, document["id"])
                category_item.addChild(doc_item)
            self.document_tree.addTopLevelItem(category_item)
            category_item.setExpanded(True)

    def _render_chat(self) -> None:
        while self.chat_messages_layout.count() > 1:
            item = self.chat_messages_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        if self.current_chat_id is None:
            self.empty_state.show()
            return

        self.empty_state.hide()
        messages = self.storage.get_messages(self.current_chat_id)
        for message in messages:
            refs = []
            for path in message["references"]:
                document = self.storage.get_document_by_path(path)
                if document:
                    refs.append(document)
            bubble = MessageBubble(message["role"], message["content"], refs)
            bubble.reference_clicked.connect(self._open_document_by_path)
            self.chat_messages_layout.insertWidget(self.chat_messages_layout.count() - 1, bubble)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(self.chat_scroll.verticalScrollBar().maximum())

    def _on_chat_selected(self, item: QListWidgetItem) -> None:
        self.current_chat_id = int(item.data(Qt.ItemDataRole.UserRole))
        title = item.text().splitlines()[0]
        self.chat_title.setText(title)
        self._render_chat()

    def _toggle_documents(self) -> None:
        self.docs_panel.setVisible(not self.docs_panel.isVisible())

    def _toggle_sidebar(self) -> None:
        self.sidebar_collapsed = not self.sidebar_collapsed
        self.sidebar.setVisible(not self.sidebar_collapsed)
        if self.sidebar_collapsed:
            self.main_splitter.setSizes([0, 1440])
        else:
            self.main_splitter.setSizes([320, 1120])

    def _toggle_theme(self) -> None:
        self.theme = "light" if self.theme == "dark" else "dark"
        self.storage.set_setting("theme", self.theme)
        self._apply_settings()

    def _on_document_tree_clicked(self, item: QTreeWidgetItem) -> None:
        document_id = item.data(0, Qt.ItemDataRole.UserRole)
        if document_id is None:
            return
        document = self.storage.get_document_by_id(document_id)
        if document:
            self._open_document_by_path(document["path"])

    def _open_document_by_path(self, path: str) -> None:
        QDesktopServices.openUrl(QUrl.fromLocalFile(path))

    def _new_chat(self) -> None:
        chat_id = self.storage.create_chat("New Chat")
        self.current_chat_id = chat_id
        self._populate_chat_list()
        for index in range(self.chat_list.count()):
            item = self.chat_list.item(index)
            if int(item.data(Qt.ItemDataRole.UserRole)) == chat_id:
                self.chat_list.setCurrentItem(item)
                self._on_chat_selected(item)
                break

    def _rename_chat(self) -> None:
        if self.current_chat_id is None:
            return
        title, accepted = QInputDialog.getText(self, "Rename Chat", "New title:", text=self.chat_title.text())
        if accepted and title.strip():
            self.storage.rename_chat(self.current_chat_id, title.strip())
            self._populate_chat_list()

    def _delete_chat(self) -> None:
        if self.current_chat_id is None:
            return
        confirmed = QMessageBox.question(self, "Delete Chat", "Delete the selected chat?")
        if confirmed == QMessageBox.StandardButton.Yes:
            self.storage.delete_chat(self.current_chat_id)
            self.current_chat_id = None
            self.chat_title.setText("Select or start a chat")
            self._populate_chat_list()
            self._render_chat()

    def _attach_file(self) -> None:
        file_path, _ = QFileDialog.getOpenFileName(self, "Attach Local File", str(self.storage.config.library_root))
        if not file_path:
            return
        self.pending_references.append(file_path)
        count = len(self.pending_references)
        self.pending_refs_label.setText(f"{count} attached reference{'s' if count != 1 else ''}")

    def _handle_quick_action(self, label: str) -> None:
        action_map = {
            "View Docs": "Use the document button in the top-right corner to open the local library shelf.",
            "Recent PDFs": "Browse Manuals, Maps, Farming, Textbooks, and Diagrams for the latest local references.",
            "Maps": "Ask for a state map or open the Maps categories from the document shelf.",
            "Open Folder": "Use the Open Home Folder button in the sidebar to jump back into the Pi file system.",
        }
        QMessageBox.information(self, label, action_map[label])

    def _send_message(self) -> None:
        if self.current_chat_id is None:
            self._new_chat()

        content = self.composer.toPlainText().strip()
        if not content or self.current_chat_id is None:
            return

        self.storage.add_message(self.current_chat_id, "user", content, self.pending_references)
        reply, references = self._draft_local_reply(content)
        self.storage.add_message(self.current_chat_id, "assistant", reply, references)
        self.composer.clear()
        self.pending_references = []
        self.pending_refs_label.setText("No attached references")
        self._populate_chat_list()
        self._render_chat()

    def _draft_local_reply(self, content: str) -> tuple[str, list[str]]:
        matches = self.storage.search_documents(content, limit=5)
        visual_terms = {
            "circuit", "schematic", "diagram", "regulator", "wiring", "rectifier", "power supply",
            "photo", "image", "map", "window", "frame", "container", "shipping container", "shelter",
        }
        query_lower = content.lower()
        visual_matches = [doc for doc in matches if _is_visual_reference(doc["path"])]

        if not visual_matches and any(term in query_lower for term in visual_terms):
            diagram_matches = self.storage.search_documents(
                "circuit diagram regulator rectifier wiring map photo image shelter container window frame",
                limit=10,
            )
            visual_matches = [doc for doc in diagram_matches if _is_visual_reference(doc["path"])]
            seen_paths = {doc["path"] for doc in matches}
            for document in visual_matches:
                if document["path"] not in seen_paths:
                    matches.append(document)

        if matches:
            highlights = matches[:3]
            bullets = "\n".join(f"- {doc['title']} ({doc['category']})" for doc in highlights)
            references = [doc["path"] for doc in matches[:6]]
            visual_line = ""
            if visual_matches:
                visual_line = "\n\nI also attached local visual references so the response can show actual diagrams, maps, or photos alongside the text."
            reply = (
                "I found local references that look useful for this request.\n\n"
                f"{bullets}\n\n"
                "This native app is set up to ground the conversation in your indexed files and surface visuals whenever it finds them."
                f"{visual_line}"
            )
            return reply, references

        return (
            "I saved your message locally. There are no direct indexed matches yet, but the app is ready for future local model integration, PDF intelligence, and semantic search.",
            [],
        )

    def _toggle_fullscreen(self) -> None:
        if self.isFullScreen():
            self.showNormal()
        else:
            self.showFullScreen()

    def _show_desktop(self) -> None:
        if self.isFullScreen():
            self.showNormal()
        self.showMinimized()

    def _open_home_folder(self) -> None:
        QDesktopServices.openUrl(QUrl.fromLocalFile(str(Path.home())))

    def _reindex_documents(self) -> None:
        self.storage.reindex_documents()
        self.storage.set_setting("index_status", "Reindexed from local library")
        self._populate_document_tree()
        QMessageBox.information(self, "Reindex Complete", "The local document library has been refreshed.")
