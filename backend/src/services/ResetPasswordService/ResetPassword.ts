import sequelize from "sequelize";
import database from "../../database";
import { hash } from "bcryptjs";

const ResetPassword = async (
  email: string,
  token: string,
  password: string
): Promise<boolean> => {
  const passwordHash = await hash(password, 8);
  const updatedUsers = await database.query<{ id: number }>(
    `UPDATE "Users"
       SET "passwordHash" = :passwordHash, "resetPassword" = '', "resetPasswordExpires" = NULL
     WHERE email = :email
       AND "resetPassword" = :token
       AND "resetPassword" != ''
       AND "resetPasswordExpires" IS NOT NULL
       AND "resetPasswordExpires" > NOW()
     RETURNING id`,
    {
      replacements: { email, token, passwordHash },
      type: sequelize.QueryTypes.SELECT
    }
  );

  return updatedUsers.length === 1;
};

export default ResetPassword;
