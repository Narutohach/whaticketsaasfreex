const OnlyForSuperUser = ({ user = {}, yes = () => null, no = () => null }) =>
	user.super ? yes() : no();

export default OnlyForSuperUser;