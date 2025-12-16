import { createPortal } from 'react-dom';

interface TransactionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function TransactionModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false
}: TransactionModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={!isLoading ? onCancel : undefined}
            />

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-cyan-500/10">
                {/* Cyberpunk Header Glow */}
                <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-cyan-400">⬡</span>
                    {title}
                </h3>
                <p className="text-gray-300 mb-6 whitespace-pre-wrap text-sm leading-relaxed">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-400 hover:text-white font-semibold transition-colors disabled:opacity-50 border border-gray-700 rounded-lg hover:border-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing...
                            </>
                        ) : (
                            <>
                                <span>✓</span>
                                Sign & Confirm
                            </>
                        )}
                    </button>
                </div>

                {/* Cyberpunk Footer Glow */}
                <div className="absolute -bottom-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
        </div>,
        document.body
    );
}
