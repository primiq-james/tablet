from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QCheckBox,
    QDialog,
    QDialogButtonBox,
    QFormLayout,
    QLabel,
    QLineEdit,
    QSpinBox,
    QVBoxLayout,
)


class SettingsDialog(QDialog):
    def __init__(self, settings: dict[str, str], parent=None) -> None:
        super().__init__(parent)
        self.setWindowTitle("System Settings")
        self.setModal(True)
        self.resize(520, 420)

        self.storage_input = QLineEdit(settings.get("storage_status", "Local SSD placeholder"))
        self.backend_input = QLineEdit(settings.get("backend_status", "Local backend placeholder"))
        self.index_input = QLineEdit(settings.get("index_status", "Ready"))
        self.theme_checkbox = QCheckBox("Dark field theme")
        self.theme_checkbox.setChecked(settings.get("theme", "dark") == "dark")
        self.offline_checkbox = QCheckBox("Offline-first mode")
        self.offline_checkbox.setChecked(settings.get("offline_mode", "true") == "true")
        self.touch_checkbox = QCheckBox("Touch-optimized spacing")
        self.touch_checkbox.setChecked(settings.get("touch_mode", "true") == "true")
        self.font_scale_spin = QSpinBox()
        self.font_scale_spin.setRange(90, 150)
        self.font_scale_spin.setSuffix("%")
        self.font_scale_spin.setValue(int(settings.get("font_scale", "100")))

        layout = QVBoxLayout(self)
        intro = QLabel("Runtime placeholders and local system preferences for the field tablet.")
        intro.setWordWrap(True)
        intro.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignTop)
        layout.addWidget(intro)

        form = QFormLayout()
        form.setLabelAlignment(Qt.AlignmentFlag.AlignLeft)
        form.addRow("Storage status", self.storage_input)
        form.addRow("Backend status", self.backend_input)
        form.addRow("Indexing status", self.index_input)
        form.addRow("Font scale", self.font_scale_spin)
        form.addRow("", self.theme_checkbox)
        form.addRow("", self.offline_checkbox)
        form.addRow("", self.touch_checkbox)
        layout.addLayout(form)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Save | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addStretch(1)
        layout.addWidget(buttons)

    def values(self) -> dict[str, str]:
        return {
            "storage_status": self.storage_input.text().strip(),
            "backend_status": self.backend_input.text().strip(),
            "index_status": self.index_input.text().strip(),
            "theme": "dark" if self.theme_checkbox.isChecked() else "light",
            "offline_mode": "true" if self.offline_checkbox.isChecked() else "false",
            "touch_mode": "true" if self.touch_checkbox.isChecked() else "false",
            "font_scale": str(self.font_scale_spin.value()),
        }
