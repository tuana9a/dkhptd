class ClassToRegister:
    class_id: str
    second_class_id: str
    learn_day_number: int
    class_type: str
    subject_id: str
    subject_name: str
    learn_at_day_of_week: int
    learn_time: str
    learn_room: str
    learn_week: str
    describe: str
    term_id: str

    def __init__(self, **kwargs):
        for key in kwargs:
            self.__setattr__(key, kwargs[key])
        pass

    def __str__(self) -> str:
        d = vars(self)
        return " ".join(list(map(lambda x: str(d[x]), d.keys())))