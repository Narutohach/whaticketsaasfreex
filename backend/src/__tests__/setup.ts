// A chave de teste não protege dados reais; ela só permite validar os fluxos
// criptográficos sem depender de um .env.test local, que é intencionalmente
// ignorado pelo Git.
process.env.ENCRYPTION_KEY ??= "test_encryption_key_only_for_automated_tests";
