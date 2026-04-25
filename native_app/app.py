from __future__ import annotations

import sys

from PySide6.QtGui import QFont
from PySide6.QtWidgets import QApplication

from native_app.config import NativeConfig
from native_app.storage import Storage
from native_app.ui.main_window import MainWindow


def main() -> int:
    config = NativeConfig()
    storage = Storage(config)
    storage.initialize()

    app = QApplication(sys.argv)
    app.setApplicationName(config.app_name)
    app.setOrganizationName("CircuitTablet")
    app.setQuitOnLastWindowClosed(True)

    font = QFont("Inter")
    font.setPointSize(11)
    app.setFont(font)

    window = MainWindow(storage)
    window.showFullScreen()

    try:
        return app.exec()
    finally:
        storage.close()
