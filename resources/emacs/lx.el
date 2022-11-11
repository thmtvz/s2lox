;;; lx.el --- Major mode for the s2lox language

;; Copyleft 2022 Thiago Martins Vaz<thmtvz@protonmail.com>

;; Author: Thiago Martins Vaz<thmtvz@protonmail.com>
;; Version: 0.1
;; Package-Requires: ((emacs "28.2"))
;; Keywords: s2lox

;; URL: https://github.com/thmtvz/s2lox/blob/main/resources/emacs/lx.el

;; This file is not part of GNU Emacs.

;; This file is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation; either version 3, or (at your option)
;; any later version.

;; This file is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program. If not, see <http://www.gnu.org/licenses/>.

;;; Comentary:

;; Package provides major mode for editing s2lox language, a 
;; variation of the Lox language.

;; Took A LOT From Looking AT https://github.com/timmyjose-projects/lox-mode

;;; Code:

(defvar lx-mode-hook nil)

(defconst lx-keywords
  '("import" "class" "fun" "var" "for" "if" "else" "while" "return" "and" "or" "super" "this"))

(defconst lx-builtins
  '("print" "toString" "number" "random" "clock"))

(defconst lx-constants
  '("nil" "true" "false"))

(defvar lx-font-lock-definitions
  (append
   `((,(regexp-opt lx-keywords) . font-lock-keyword-face)
     (,(regexp-opt lx-builtins) . font-lock-builtin-face)
     (,(regexp-opt lx-constants) . font-lock-constant-face))))

;;;###autoload
(add-to-list 'auto-mode-alist '("\\.lx\\'" . lx-mode))

(define-derived-mode lx-mode c-mode "s2Lox"
  "A major mode for the s2lox programming language.
  \\{lox-mode-map}"
  :group 'lx-mode-group
  (setq-local comment-start "// ")
  (setq-local comment-end "")
  (setq font-lock-defaults '(lx-font-lock-definitions)))

(provide 'lox-mode)
