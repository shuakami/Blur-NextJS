import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmailService } from '@/lib/email';
import Meta from '@/components/ui/Meta';
import { Mail, Key, Server, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/tofu/confirm-modal';
import { useAuth } from '@clerk/nextjs';
import { AtSign } from 'lucide-react';

export default function EmailConfigPage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [config, setConfig] = useState({
    user_id: userId || '',
    username: '',
    password: '',
    email: '',
    imap_server: '',
    smtp_server: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setShowRiskDialog(true);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await EmailService.saveConfig(config);
      if (response.success) {
        setShowSuccessDialog(true);
      } else {
        setError(response.error || '保存配置失败');
      }
    } catch (err: any) {
      setError(err.message || '保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setShowRiskDialog(false);
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSuccess = () => {
    setShowSuccessDialog(false);
    window.close();
  };

  const basicFields = [
    {
      label: "邮箱账号",
      name: "username",
      type: "text",
      placeholder: "请输入邮箱账号",
      icon: <Mail className="h-4 w-4" />,
      value: config.username
    },
    {
      label: "邮箱密码",
      name: "password",
      type: "password",
      placeholder: "请输入邮箱密码",
      icon: <Key className="h-4 w-4" />,
      value: config.password
    },
    {
      label: "完整邮箱地址",
      name: "email",
      type: "email", 
      placeholder: "example@domain.com",
      icon: <AtSign className="h-4 w-4" />,
      value: config.email
    }
  ];

  const serverFields = [
    {
      label: "IMAP服务器",
      name: "imap_server",
      type: "text",
      placeholder: "imap.example.com",
      icon: <Server className="h-4 w-4" />,
      value: config.imap_server
    },
    {
      label: "SMTP服务器", 
      name: "smtp_server",
      type: "text",
      placeholder: "smtp.example.com",
      icon: <Server className="h-4 w-4" />,
      value: config.smtp_server
    }
  ];

  return (
    <>
      <Meta pageName="邮箱配置" pageDescription="配置邮箱账号信息" />
      
      {/* 风险提示对话框 */}
      <ConfirmModal
        isOpen={showRiskDialog}
        onClose={() => setShowRiskDialog(false)}
        onConfirm={nextStep}
        title="安全提示"
        message={`在继续之前，请您注意，我们会加密存储您的邮箱配置信息，但仍然建议使用应用专用密码而非主密码。如果您使用的是Gmail，请开启两步验证并使用应用密码，定期更改密码可以提高账号安全性，同时请确保您了解相关的安全风险。`}
        type="warning"
        confirmText="我已了解风险"
        cancelText="返回修改"
      />

      {/* 成功提示对话框 */}
      <ConfirmModal
        isOpen={showSuccessDialog}
        onClose={handleSuccess}
        onConfirm={handleSuccess}
        title="配置成功"
        message="邮件配置已保存"
        type="default"
        confirmText="确定"
      />

      <div className="min-h-screen bg-white dark:bg-black flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
          <div className="h-full flex items-center justify-between px-6 max-w-[800px] mx-auto w-full">
            <Link href={{ pathname: "/" }} className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">返回</span>
            </Link>
            {/* 步骤指示器 */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step === 1 ? 'border-primary' : 'border-gray-400'}`}>
                  1
                </div>
                <span className="hidden sm:inline">基本信息</span>
              </div>
              <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step === 2 ? 'border-primary' : 'border-gray-400'}`}>
                  2
                </div>
                <span className="hidden sm:inline">服务器配置</span>
              </div>
            </div>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[800px] mx-auto bg-white -mt-12 dark:bg-black rounded-lg lg:grid lg:grid-cols-2">
            {/* 左侧说明 */}
            <div className="flex flex-col justify-center p-6 lg:p-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-2xl lg:text-3xl font-medium">
                  {step === 1 ? '配置邮箱' : '服务器设置'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {step === 1 
                    ? '请填写您的邮箱账号信息，我们将安全加密存储您的配置。'
                    : '请填写邮箱服务器信息，您可以在邮箱设置中找到这些信息。'
                  }
                </p>
              </motion.div>
            </div>

            {/* 右侧表单 */}
            <div className="border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 p-6 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {(step === 1 ? basicFields : serverFields).map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {field.icon}
                            {field.label}
                          </label>
                          <Input
                            type={field.type}
                            name={field.name}
                            value={field.value}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="h-10 bg-transparent"
                            required
                          />
                        </div>
                      </motion.div>
                    ))}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 dark:text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-4"
                    >
                      {step === 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1"
                        >
                          上一步
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 gap-2 ${step === 1 ? 'w-full' : ''}`}
                      >
                        {loading ? '保存中...' : (
                          <>
                            {step === 1 ? '下一步' : '完成配置'}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 