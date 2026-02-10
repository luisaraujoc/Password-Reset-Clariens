import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { maskCPF, maskCEP, maskPhone, validateCPF, unmaskDigits, extractPhoneWithoutDDD, maskPartial } from "@/lib/masks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  matricula: z.string().trim().max(50, "Máximo 50 caracteres"),
  cpf: z.string().min(1, "CPF é obrigatório").refine(
    (val) => validateCPF(val),
    { message: "CPF inválido" }
  ),
  rg: z.string().trim().max(20, "Máximo 20 caracteres"),
  cep: z.string().trim().max(10, "Máximo 10 caracteres"),
  dataNascimento: z.date({ required_error: "Data de nascimento é obrigatória" }),
  celular: z.string().min(1, "Número de celular é obrigatório").refine(
    (val) => unmaskDigits(val).length === 11,
    { message: "Número de celular inválido (deve ter DDD + 9 dígitos)" }
  ),
  email: z.string().min(1, "E-mail é obrigatório").email("Formato de e-mail inválido").max(255, "Máximo 255 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

interface SubmittedData {
  matricula: string;
  cpf: string;
  rg: string;
  cep: string;
  dataNascimento: string;
  celular: string;
  email: string;
}

export default function IdentityForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricula: "",
      cpf: "",
      rg: "",
      cep: "",
      celular: "",
      email: "",
    },
  });

  function onSubmit(data: FormData) {
    const payload = {
      matricula: data.matricula,
      cpf: unmaskDigits(data.cpf),
      rg: data.rg,
      cep: unmaskDigits(data.cep),
      dataNascimento: format(data.dataNascimento, "yyyy-MM-dd"),
      celular: extractPhoneWithoutDDD(data.celular),
      email: data.email,
    };

    // TODO: Enviar para API
    console.log("Payload para API:", payload);

    setSubmittedData({
      matricula: data.matricula,
      cpf: data.cpf,
      rg: data.rg,
      cep: data.cep,
      dataNascimento: format(data.dataNascimento, "dd/MM/yyyy"),
      celular: data.celular,
      email: data.email,
    });
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setSubmittedData(null);
    form.reset();
  }

  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] via-[hsl(248,60%,50%)] to-[hsl(270,55%,45%)] flex flex-col">
        <header className="w-full py-6 px-4 text-center">
          <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow">Clariens</h2>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 pb-8">
          <Card className="w-full max-w-lg shadow-2xl border-0">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Solicitação enviada com sucesso!
              </h1>
              <p className="text-muted-foreground text-sm">
                Sua solicitação de reset de senha foi recebida. Confira abaixo o resumo dos dados enviados.
              </p>

              <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4 text-sm">
                {submittedData.matricula && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matrícula</span>
                    <span className="font-medium">{maskPartial(submittedData.matricula)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPF</span>
                  <span className="font-medium">{maskPartial(submittedData.cpf, 6)}</span>
                </div>
                {submittedData.rg && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RG</span>
                    <span className="font-medium">{maskPartial(submittedData.rg)}</span>
                  </div>
                )}
                {submittedData.cep && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CEP</span>
                    <span className="font-medium">{submittedData.cep}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data de Nascimento</span>
                  <span className="font-medium">{submittedData.dataNascimento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Celular</span>
                  <span className="font-medium">{maskPartial(submittedData.celular, 5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-mail</span>
                  <span className="font-medium">{maskPartial(submittedData.email, 8)}</span>
                </div>
              </div>

              <Button onClick={handleReset} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(225,70%,45%)] via-[hsl(248,60%,50%)] to-[hsl(270,55%,45%)] flex flex-col">
      <header className="w-full py-8 px-4 text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-wide text-white drop-shadow">Clariens</h2>
        <div className="flex items-center justify-center gap-2 mt-4">
          <ShieldCheck className="w-6 h-6 text-white/80" />
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            Confirmação de Identidade
          </h1>
        </div>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          Preencha os dados abaixo para validar sua identidade e solicitar o reset de senha
        </p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-8">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Matrícula */}
                <FormField control={form.control} name="matricula" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2024001234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* CPF */}
                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        value={field.value}
                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* RG */}
                <FormField control={form.control} name="rg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do RG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* CEP */}
                <FormField control={form.control} name="cep" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        value={field.value}
                        onChange={(e) => field.onChange(maskCEP(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Data de Nascimento */}
                <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              : "Selecione a data"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          captionLayout="dropdown-buttons"
                          fromYear={1940}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Celular */}
                <FormField control={form.control} name="celular" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Celular <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* E-mail */}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail Pessoal <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* LGPD Notice */}
                <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <p>
                    Em conformidade com a <strong>LGPD</strong> (Lei Geral de Proteção de Dados), informamos que nenhum dos dados coletados neste formulário será armazenado ou retido para outros usos. Estes dados possuem apenas fins de{" "}
                    <strong>validação e confirmação de identidade</strong> junto às plataformas geridas pela Clariens.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[hsl(225,70%,45%)] to-[hsl(270,55%,50%)] hover:from-[hsl(225,70%,40%)] hover:to-[hsl(270,55%,45%)] text-white shadow-lg"
                >
                  Confirmar Identidade
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
