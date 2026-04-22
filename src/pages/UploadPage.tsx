import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `${data.count} registros processados com sucesso. Os dados anteriores foram substituídos.`,
          data: data.data
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao processar o arquivo.'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Falha na comunicação com o servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Upload de Dados (Excel)</h2>
        <p className="text-slate-500 mt-2">Envie a planilha financeira para atualizar os dados do cliente selecionado.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4 items-start">
        <AlertCircle className="text-amber-500 shrink-0" size={24} />
        <div>
          <p className="text-sm font-bold text-amber-900">Atenção: Sobrescrita de Dados</p>
          <p className="text-xs text-amber-700 mt-1">Ao realizar o upload, os dados financeiros anteriores deste cliente vindos de planilhas serão totalmente removidos e substituídos pelos novos.</p>
        </div>
      </div>

      <div 
        id="excel-upload-zone"
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all overflow-hidden",
          file ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 hover:border-emerald-400 bg-white"
        )}
      >
        <div className="flex flex-col items-center justify-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
            file ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
          )}>
            {file ? <FileSpreadsheet size={32} /> : <Upload size={32} />}
          </div>
          
          {file ? (
            <div className="text-center z-10">
              <p className="text-lg font-bold text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
              <button 
                id="remove-file-btn"
                type="button"
                onClick={() => setFile(null)}
                className="text-xs font-bold text-rose-500 uppercase mt-4 hover:underline relative z-20"
              >
                Remover arquivo
              </button>
            </div>
          ) : (
            <label 
              htmlFor="excel-file-input"
              className="text-center cursor-pointer flex flex-col items-center group w-full"
            >
              <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Selecione uma planilha</p>
              <p className="text-sm text-slate-500 mt-1">Arraste ou clique para buscar arquivo .xlsx ou .csv</p>
              <input 
                id="excel-file-input"
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange}
                className="hidden"
              />
              {/* This inner absolute div covers only the label's parent scope if needed, 
                  but Label + hidden input is cleaner for "clicking anywhere in the box" 
                  if the label is width full and the parent has p-12 */}
              <div className="absolute inset-0 z-0 group-hover:bg-emerald-500/5 transition-colors"></div>
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <button 
          id="download-template-btn"
          type="button"
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Download size={18} />
          Baixar Modelo de Planilha
        </button>

        <button
          id="confirm-upload-btn"
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className={cn(
            "px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3",
            !file || loading 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95"
          )}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {loading ? 'Processando...' : 'Confirmar e Importar'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "p-6 rounded-2xl border flex gap-4",
              result.success ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-rose-50 border-rose-100 text-rose-900"
            )}
          >
            {result.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <div>
              <p className="font-bold">{result.success ? 'Sucesso!' : 'Ocorreu um erro'}</p>
              <p className="text-sm opacity-90">{result.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
